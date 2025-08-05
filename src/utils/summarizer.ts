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

// Article extraction service with comprehensive fallback system
export class ArticleExtractor {
  static async extractContent(url: string): Promise<ArticleContent> {
    console.log('🔍 Starting article extraction for:', url);
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return { 
        success: false, 
        error: 'Invalid URL format. Please check the URL and try again.' 
      };
    }
    
    // Multiple proxy services with different approaches
    const extractionMethods = [
      () => this.tryAllOriginsProxy(url),
      () => this.tryCorsBridgeProxy(url),
      () => this.tryThingProxyService(url),
      () => this.tryDirectFetch(url),
      () => this.trySimpleProxy(url)
    ];
    
    for (const [index, method] of extractionMethods.entries()) {
      try {
        console.log(`🚀 Trying extraction method ${index + 1}/5...`);
        const result = await method();
        
        if (result.success && result.content && result.content.length > 200) {
          console.log(`✅ Success with method ${index + 1}!`);
          return result;
        } else {
          console.log(`❌ Method ${index + 1} failed or returned insufficient content`);
        }
      } catch (error) {
        console.log(`💥 Method ${index + 1} threw error:`, error);
      }
    }
    
    return { 
      success: false, 
      error: 'Unable to extract article content. This could be due to:\n• Website blocking automated access\n• Paywall or login required\n• Content loaded dynamically\n\nTry using the TEXT input mode instead - copy and paste the article text directly.' 
    };
  }
  
  // Method 1: AllOrigins proxy
  static async tryAllOriginsProxy(url: string): Promise<ArticleContent> {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    
    if (!response.ok) throw new Error(`AllOrigins failed: ${response.status}`);
    
    const data = await response.json();
    return this.parseArticleContent(data.contents, url);
  }
  
  // Method 2: CORS Bridge
  static async tryCorsBridgeProxy(url: string): Promise<ArticleContent> {
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    const response = await fetch(proxyUrl, {
      headers: { 
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });
    
    if (!response.ok) throw new Error(`CORS Bridge failed: ${response.status}`);
    
    const html = await response.text();
    return this.parseArticleContent(html, url);
  }
  
  // Method 3: ThingProxy
  static async tryThingProxyService(url: string): Promise<ArticleContent> {
    const proxyUrl = `https://thingproxy.freeboard.io/fetch/${url}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) throw new Error(`ThingProxy failed: ${response.status}`);
    
    const html = await response.text();
    return this.parseArticleContent(html, url);
  }
  
  // Method 4: Direct fetch (might work for some sites)
  static async tryDirectFetch(url: string): Promise<ArticleContent> {
    const response = await fetch(url, {
      mode: 'cors',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    
    if (!response.ok) throw new Error(`Direct fetch failed: ${response.status}`);
    
    const html = await response.text();
    return this.parseArticleContent(html, url);
  }
  
  // Method 5: Simple proxy fallback
  static async trySimpleProxy(url: string): Promise<ArticleContent> {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) throw new Error(`Simple proxy failed: ${response.status}`);
    
    const html = await response.text();
    return this.parseArticleContent(html, url);
  }
  
  
  static parseArticleContent(html: string, url: string): ArticleContent {
    try {
      console.log('📄 Parsing HTML content, length:', html.length);
      
      // Check if we got an error page or blocked content
      if (html.includes('Access Denied') || html.includes('403 Forbidden') || html.includes('Blocked')) {
        return { 
          success: false, 
          error: 'Access denied by the website. Try the text input mode instead.' 
        };
      }
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove unwanted elements
      const unwanted = doc.querySelectorAll(`
        script, style, nav, header, footer, aside, 
        .ad, .advertisement, .social-share, .comments, 
        .sidebar, .related-articles, .navigation,
        [class*="ad"], [class*="banner"], [id*="ad"],
        .popup, .modal, .overlay, .cookie-notice
      `);
      unwanted.forEach(el => el.remove());
      
      // Enhanced content selectors
      const contentSelectors = [
        'article',
        '[role="main"]',
        '.content',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.story-content',
        'main',
        '.story-body',
        '.article-body',
        '.post-body',
        '.content-body',
        '[class*="content"]',
        '[class*="article"]',
        '[class*="story"]',
        '[class*="post-text"]',
        '[class*="body-text"]'
      ];
      
      let content = '';
      let title = '';
      
      // Extract title with better selectors
      const titleSelectors = [
        'h1', 
        '.title', 
        '.headline', 
        '.article-title', 
        '.post-title',
        '[class*="headline"]',
        '[class*="title"]',
        'title'
      ];
      
      for (const selector of titleSelectors) {
        const titleEl = doc.querySelector(selector);
        if (titleEl && titleEl.textContent) {
          title = titleEl.textContent.trim();
          if (title.length > 10 && 
              !title.toLowerCase().includes('404') && 
              !title.toLowerCase().includes('error') &&
              !title.toLowerCase().includes('access denied')) {
            break;
          }
        }
      }
      
      console.log('📰 Extracted title:', title);
      
      // Extract content with improved approach
      for (const selector of contentSelectors) {
        const elements = doc.querySelectorAll(selector);
        
        for (const element of elements) {
          // Remove ads and unwanted content within the element
          const innerUnwanted = element.querySelectorAll(`
            script, style, .ad, .advertisement, .social-share, 
            .comments, nav, aside, .sidebar, [class*="ad"],
            .author-bio, .related-posts, .newsletter-signup
          `);
          innerUnwanted.forEach(el => el.remove());
          
          const elementText = element.textContent?.trim() || '';
          if (elementText.length > content.length && elementText.length > 500) {
            content = elementText;
            console.log(`📝 Better content found via ${selector}:`, content.length, 'chars');
          }
        }
        
        if (content.length > 1000) break; // We have good content
      }
      
      // Fallback to paragraphs if no main content found
      if (!content || content.length < 500) {
        console.log('🔄 Falling back to paragraph extraction...');
        const paragraphs = Array.from(doc.querySelectorAll('p'))
          .map(p => p.textContent?.trim())
          .filter(text => text && text.length > 50 && !text.includes('cookie') && !text.includes('subscribe'))
          .join(' ');
        
        if (paragraphs.length > content.length) {
          content = paragraphs;
          console.log('📄 Using paragraph fallback:', content.length, 'characters');
        }
      }
      
      // Clean and process content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/[^\w\s.,!?;:()"'-]/g, ' ')
        .trim();
      
      console.log('✨ Final processed content:', content.length, 'characters');
      
      if (!content || content.length < 200) {
        return { 
          success: false, 
          error: 'Could not extract meaningful content. The article might be:\n• Behind a paywall\n• Loaded dynamically with JavaScript\n• Protected from automated access\n\nTry copying the text and using TEXT input mode.' 
        };
      }
      
      return { 
        success: true, 
        content: content.slice(0, 12000), // Increased limit
        title 
      };
    } catch (error) {
      console.error('💥 Content parsing failed:', error);
      return { 
        success: false, 
        error: 'Failed to parse the article content. Try the text input mode.' 
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
      console.log('🚀 Starting summarization process for:', url);
      
      // Extract article content
      const extraction = await ArticleExtractor.extractContent(url);
      if (!extraction.success || !extraction.content) {
        console.error('❌ Article extraction failed:', extraction.error);
        return { 
          success: false, 
          error: extraction.error || 'Failed to extract article content' 
        };
      }
      
      console.log('✅ Article extracted successfully, generating summary...');
      
      // Try summarization with retry logic
      return await this.generateSummaryWithRetry(extraction.content, extraction.title);
      
    } catch (error) {
      console.error('💥 Summarization error:', error);
      return { 
        success: false, 
        error: `Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async summarizeText(text: string): Promise<SummaryResult> {
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'API key not configured. Please set your Gemini API key.' 
      };
    }
    
    try {
      console.log('🚀 Starting direct text summarization...');
      
      if (!text || text.length < 100) {
        return { 
          success: false, 
          error: 'Text is too short. Please provide at least 100 characters.' 
        };
      }
      
      // Try summarization with retry logic
      return await this.generateSummaryWithRetry(text.slice(0, 10000));
      
    } catch (error) {
      console.error('💥 Text summarization error:', error);
      return { 
        success: false, 
        error: `Text summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async generateSummaryWithRetry(content: string, title?: string): Promise<SummaryResult> {
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    const maxRetries = 3;
    
    for (const modelName of models) {
      console.log(`🤖 Trying model: ${modelName}`);
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} with ${modelName}...`);
          
          const model = this.genAI!.getGenerativeModel({ model: modelName });
          
          const prompt = `You are an expert editor for a classic newspaper. Your task is to create a concise, professional summary of the following article.

Requirements:
- Write exactly 60 words
- Use clear, concise English in a classic newspaper editorial tone
- Focus on the most important facts and key points
- Write in third person
- Maintain journalistic objectivity
- No sensationalism or opinion

${title ? `Article Title: ${title}\n\n` : ''}Article Content:
${content}

Provide only the 60-word summary, nothing else.`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const summary = response.text().trim();
          
          console.log(`✅ Summary generated successfully with ${modelName}:`, summary);
          
          if (!summary) {
            throw new Error('Empty response from AI');
          }
          
          return { 
            success: true, 
            summary 
          };
          
        } catch (error: any) {
          console.log(`⚠️ Attempt ${attempt} failed with ${modelName}:`, error.message);
          
          // Check if it's an overload error (503)
          if (error.message?.includes('overloaded') || error.message?.includes('503')) {
            console.log(`⏳ Model ${modelName} is overloaded, waiting before retry...`);
            
            if (attempt < maxRetries) {
              // Exponential backoff: 2s, 4s, 8s
              const delay = Math.pow(2, attempt) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            } else {
              console.log(`🔄 Max retries reached for ${modelName}, trying next model...`);
              break; // Try next model
            }
          } else {
            // Non-overload error, try next model immediately
            console.log(`❌ Non-overload error with ${modelName}, trying next model...`);
            break;
          }
        }
      }
    }
    
    return { 
      success: false, 
      error: 'Google AI services are currently overloaded. This is a temporary issue on Google\'s servers.\n\n🔄 Please try again in a few minutes\n⏰ Peak hours often have higher traffic\n💡 You can also try using the TEXT input mode which sometimes works better during high traffic periods' 
    };
  }
}