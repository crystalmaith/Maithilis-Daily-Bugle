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

// Article extraction service with multiple CORS proxy fallbacks
export class ArticleExtractor {
  static async extractContent(url: string): Promise<ArticleContent> {
    console.log('Attempting to extract content from:', url);
    
    // Multiple CORS proxy services to try
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
    ];
    
    for (const [index, proxyUrl] of proxies.entries()) {
      try {
        console.log(`Trying proxy ${index + 1}:`, proxyUrl);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (!response.ok) {
          console.log(`Proxy ${index + 1} failed with status:`, response.status);
          continue;
        }
        
        let html: string;
        
        // Handle different response formats from different proxies
        if (index === 0) { // allorigins.win returns JSON
          const data = await response.json();
          html = data.contents;
        } else { // other proxies return HTML directly
          html = await response.text();
        }
        
        if (!html || html.length < 100) {
          console.log(`Proxy ${index + 1} returned insufficient content`);
          continue;
        }
        
        console.log(`Successfully fetched via proxy ${index + 1}, content length:`, html.length);
        
        // Parse and extract content
        const result = this.parseArticleContent(html, url);
        if (result.success) {
          return result;
        }
        
        console.log(`Content parsing failed for proxy ${index + 1}`);
        
      } catch (error) {
        console.log(`Proxy ${index + 1} error:`, error);
        continue;
      }
    }
    
    // If all proxies fail, try direct fetch as last resort
    try {
      console.log('Trying direct fetch as last resort...');
      const response = await fetch(url);
      const html = await response.text();
      return this.parseArticleContent(html, url);
    } catch (error) {
      console.log('Direct fetch also failed:', error);
    }
    
    return { 
      success: false, 
      error: 'Unable to access the article. The website may be blocking requests or the URL may be invalid. Please try a different article URL.' 
    };
  }
  
  static parseArticleContent(html: string, url: string): ArticleContent {
    try {
      // Basic HTML parsing to extract text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove script and style elements
      const unwanted = doc.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .comments, .sidebar, .related-articles');
      unwanted.forEach(el => el.remove());
      
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
        '.content-body',
        '[class*="content"]',
        '[class*="article"]',
        '[class*="story"]'
      ];
      
      let content = '';
      let title = '';
      
      // Extract title
      const titleSelectors = ['h1', '.title', '.headline', '.article-title', '.post-title', 'title'];
      for (const selector of titleSelectors) {
        const titleEl = doc.querySelector(selector);
        if (titleEl && titleEl.textContent) {
          title = titleEl.textContent.trim();
          if (title.length > 10 && !title.toLowerCase().includes('404') && !title.toLowerCase().includes('error')) {
            break;
          }
        }
      }
      
      console.log('Extracted title:', title);
      
      // Extract content
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          // Remove unwanted elements within the content
          const innerUnwanted = element.querySelectorAll('script, style, .ad, .advertisement, .social-share, .comments, nav, aside, .sidebar');
          innerUnwanted.forEach(el => el.remove());
          
          content = element.textContent?.trim() || '';
          console.log(`Content from ${selector}:`, content.length, 'characters');
          if (content.length > 500) break; // Found substantial content
        }
      }
      
      // Fallback to paragraphs if no content area found
      if (!content || content.length < 500) {
        const paragraphs = Array.from(doc.querySelectorAll('p'))
          .map(p => p.textContent?.trim())
          .filter(text => text && text.length > 50)
          .join(' ');
        
        if (paragraphs.length > content.length) {
          content = paragraphs;
          console.log('Using paragraph fallback:', content.length, 'characters');
        }
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      console.log('Final cleaned content:', content.length, 'characters');
      
      if (!content || content.length < 200) {
        return { 
          success: false, 
          error: 'Could not extract meaningful content. The article might be behind a paywall or use dynamic loading.' 
        };
      }
      
      return { 
        success: true, 
        content: content.slice(0, 10000), // Increased limit for better context
        title 
      };
    } catch (error) {
      console.error('Content parsing failed:', error);
      return { 
        success: false, 
        error: 'Failed to parse the article content.' 
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
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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