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

// Simple article extraction service
export class ArticleExtractor {
  static async extractContent(url: string): Promise<ArticleContent> {
    try {
      // For demo purposes, we'll use a simple fetch approach
      // In production, you'd want to use a more robust solution like Mercury API or Readability
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic HTML parsing to extract text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove script and style elements
      const scripts = doc.querySelectorAll('script, style');
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
        '.story-body'
      ];
      
      let content = '';
      let title = '';
      
      // Extract title
      const titleEl = doc.querySelector('h1, .title, [class*="title"], [class*="headline"]');
      if (titleEl) {
        title = titleEl.textContent?.trim() || '';
      }
      
      // Extract content
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          content = element.textContent?.trim() || '';
          if (content.length > 200) break;
        }
      }
      
      // Fallback to body content if no specific content area found
      if (!content || content.length < 200) {
        content = doc.body.textContent?.trim() || '';
      }
      
      if (!content || content.length < 100) {
        return { success: false, error: 'Could not extract meaningful content from the article' };
      }
      
      return { 
        success: true, 
        content: content.slice(0, 5000), // Limit to 5000 chars
        title 
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to fetch article: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      // Extract article content
      const extraction = await ArticleExtractor.extractContent(url);
      if (!extraction.success || !extraction.content) {
        return { 
          success: false, 
          error: extraction.error || 'Failed to extract article content' 
        };
      }
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
You are an expert editor for a classic newspaper. Your task is to create a concise, professional summary of the following article.

Requirements:
- Write exactly 60 words
- Use clear, concise English in a classic newspaper editorial tone
- Focus on the most important facts and key points
- Write in third person
- Maintain journalistic objectivity
- No sensationalism or opinion

Article content:
${extraction.content}

Provide only the 60-word summary, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();
      
      if (!summary) {
        return { 
          success: false, 
          error: 'Failed to generate summary' 
        };
      }
      
      return { 
        success: true, 
        summary 
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}