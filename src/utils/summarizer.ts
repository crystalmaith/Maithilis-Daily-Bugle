import { GoogleGenerativeAI } from '@google/generative-ai';

interface SummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
}

interface ArticleContent {
  success: boolean;
  content?: string;
  title?: string;
  error?: string;
}

// Simple article extraction service using CORS proxy
export class ArticleExtractor {
  static async extractContent(url: string): Promise<ArticleContent> {
    try {
      console.log('Attempting to extract content from:', url);
      
      // Use a CORS proxy service for demonstration
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const html = data.contents;
      
      if (!html) {
        throw new Error('No content received from proxy');
      }
      
      console.log('HTML content received, length:', html.length);
      
      // Basic HTML parsing to extract text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove script and style elements
      const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .comments');
      scripts.forEach(el => el.remove());
      
      // Try to find the main content area
      const contentSelectors = [
        'article',
        '[role="main"]',
        '.content',
        '.article-content',
        '.post-content',
        '.entry-content',
        'main',
        '.story-body',
        '.article-body',
        '.post-body',
        '.content-body'
      ];
      
      let content = '';
      let title = '';
      
      // Extract title
      const titleSelectors = ['h1', '.title', '.headline', '.article-title', '.post-title', 'title'];
      for (const selector of titleSelectors) {
        const titleEl = doc.querySelector(selector);
        if (titleEl && titleEl.textContent) {
          title = titleEl.textContent.trim();
          if (title.length > 10) break; // Found a substantial title
        }
      }
      
      console.log('Extracted title:', title);
      
      // Extract content
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          // Remove unwanted elements within the content
          const unwanted = element.querySelectorAll('script, style, .ad, .advertisement, .social-share, .comments, nav, aside');
          unwanted.forEach(el => el.remove());
          
          content = element.textContent?.trim() || '';
          console.log(`Content from ${selector}:`, content.length, 'characters');
          if (content.length > 300) break; // Found substantial content
        }
      }
      
      // Fallback to body content if no specific content area found
      if (!content || content.length < 300) {
        // Remove unwanted elements from body
        const unwanted = doc.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .comments');
        unwanted.forEach(el => el.remove());
        
        content = doc.body.textContent?.trim() || '';
        console.log('Fallback body content:', content.length, 'characters');
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      console.log('Final cleaned content:', content.length, 'characters');
      
      if (!content || content.length < 100) {
        return { 
          success: false, 
          error: 'Could not extract meaningful content from the article. The page might be protected or content might be loaded dynamically.' 
        };
      }
      
      return { 
        success: true, 
        content: content.slice(0, 8000), // Limit to 8000 chars for API
        title 
      };
    } catch (error) {
      console.error('Article extraction failed:', error);
      return { 
        success: false, 
        error: `Failed to fetch article: ${error instanceof Error ? error.message : 'Network error or CORS restriction'}`
      };
    }
  }
}

export class ArticleSummarizer {
  private genAI: GoogleGenerativeAI | null = null;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }
  
  setApiKey(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  
  async summarizeArticle(url: string): Promise<SummaryResult> {
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'API key not configured. Please set your Gemini API key.' 
      };
    }
    
    try {
      console.log('Starting summarization process for:', url);
      
      // Extract article content
      const extraction = await ArticleExtractor.extractContent(url);
      if (!extraction.success || !extraction.content) {
        console.error('Article extraction failed:', extraction.error);
        return { 
          success: false, 
          error: extraction.error || 'Failed to extract article content' 
        };
      }
      
      console.log('Article extracted successfully, generating summary...');
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are an expert editor for a classic newspaper. Your task is to create a concise, professional summary of the following article.

Requirements:
- Write exactly 60 words
- Use clear, concise English in a classic newspaper editorial tone
- Focus on the most important facts and key points
- Write in third person
- Maintain journalistic objectivity
- No sensationalism or opinion

Article Title: ${extraction.title || 'Unknown Title'}

Article Content:
${extraction.content}

Provide only the 60-word summary, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();
      
      console.log('Summary generated:', summary);
      
      if (!summary) {
        return { 
          success: false, 
          error: 'Failed to generate summary - empty response from AI' 
        };
      }
      
      return { 
        success: true, 
        summary 
      };
    } catch (error) {
      console.error('Summarization error:', error);
      return { 
        success: false, 
        error: `Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}