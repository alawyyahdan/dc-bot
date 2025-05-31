const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const pdfParse = require('pdf-parse');

class FileProcessor {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB) || 10;
    this.supportedTypes = {
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image'
    };
    this.ensureUploadsDir();
  }

  async ensureUploadsDir() {
    await fs.ensureDir(this.uploadsDir);
  }

  async downloadFile(url, filename) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Discord Bot File Processor'
        }
      });

      // Check file size
      const contentLength = response.headers['content-length'];
      if (contentLength && parseInt(contentLength) > this.maxFileSizeMB * 1024 * 1024) {
        throw new Error(`File size exceeds ${this.maxFileSizeMB}MB limit`);
      }

      const filePath = path.join(this.uploadsDir, filename);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async processFile(attachment) {
    try {
      const { url, name, contentType, size } = attachment;

      // Check file size
      if (size > this.maxFileSizeMB * 1024 * 1024) {
        throw new Error(`File size exceeds ${this.maxFileSizeMB}MB limit`);
      }

      // Check if file type is supported
      if (!this.supportedTypes[contentType]) {
        throw new Error(`File type ${contentType} is not supported`);
      }

      // Download file
      const filename = `${Date.now()}_${name}`;
      const filePath = await this.downloadFile(url, filename);

      // Process based on file type
      const fileType = this.supportedTypes[contentType];
      let processedContent = null;

      switch (fileType) {
        case 'pdf':
          processedContent = await this.processPDF(filePath);
          break;
        case 'txt':
          processedContent = await this.processText(filePath);
          break;
        case 'image':
          processedContent = await this.processImage(filePath, url);
          break;
        default:
          throw new Error(`Processing for ${fileType} not implemented`);
      }

      // Clean up file after processing
      await this.cleanupFile(filePath);

      return {
        type: fileType,
        content: processedContent,
        originalName: name,
        size: size
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  async processPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  async processText(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return {
        text: content,
        length: content.length
      };
    } catch (error) {
      console.error('Error processing text file:', error);
      throw new Error('Failed to process text file');
    }
  }

  async processImage(filePath, originalUrl) {
    try {
      // For images, we'll return the URL for vision models
      // and basic metadata
      const stats = await fs.stat(filePath);
      
      return {
        url: originalUrl,
        size: stats.size,
        path: filePath // Keep path for vision processing
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image file');
    }
  }

  async cleanupFile(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }

  async cleanupOldFiles() {
    try {
      const files = await fs.readdir(this.uploadsDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtimeMs < oneHourAgo) {
          await this.cleanupFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }

  isSupported(contentType) {
    return !!this.supportedTypes[contentType];
  }

  getSupportedTypes() {
    return Object.keys(this.supportedTypes);
  }

  formatFileContent(processedFile, maxLength = 2000) {
    const { type, content, originalName } = processedFile;
    
    switch (type) {
      case 'pdf':
        const text = content.text.substring(0, maxLength);
        return `📄 **PDF File: ${originalName}**\n` +
               `📊 Pages: ${content.pages}\n` +
               `📝 Content Preview:\n\`\`\`\n${text}${content.text.length > maxLength ? '...' : ''}\n\`\`\``;
      
      case 'txt':
        const txtContent = content.text.substring(0, maxLength);
        return `📝 **Text File: ${originalName}**\n` +
               `📊 Length: ${content.length} characters\n` +
               `📝 Content:\n\`\`\`\n${txtContent}${content.text.length > maxLength ? '...' : ''}\n\`\`\``;
      
      case 'image':
        return `🖼️ **Image: ${originalName}**\n` +
               `📊 Size: ${(content.size / 1024).toFixed(2)} KB\n` +
               `🔗 Processing image for AI analysis...`;
      
      default:
        return `📎 **File: ${originalName}** (${type})`;
    }
  }
}

module.exports = FileProcessor; 