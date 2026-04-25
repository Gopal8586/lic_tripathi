/**
 * ERROR HANDLER LOGIC
 * Intercepts common frontend errors, fetch failures, and missing images
 * to simulate showing the correct error pages requested by the user.
 */

export function initErrorHandling() {
  // 1. Handle fetch/API errors (Simulated)
  // We hook into window.fetch to catch API failures
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch(...args);
      
      // If server returns HTTP error status, we can redirect based on the logic requested
      // EXCEPTION: Don't redirect for the email script, let the form handle it
      if (!response.ok && !args[0].includes('send-email.php')) {
        if (response.status === 400) window.location.href = '/400.html';
        else if (response.status === 401) window.location.href = '/401.html';
        else if (response.status === 403) window.location.href = '/403.html';
        else if (response.status === 404) window.location.href = '/404.html';
        else if (response.status === 500) window.location.href = '/500.html';
        else if (response.status === 502) window.location.href = '/502.html';
        else if (response.status === 503) window.location.href = '/503.html';
      }
      return response;
    } catch (error) {
      // Network failures, CORS issues, Backend down usually result in fetch rejecting
      // We can interpret this as 503 or 500
      console.error('Fetch Error Captured:', error);
      // For demonstration, uncommenting this would redirect all network errors
      // window.location.href = '/503.html'; 
      throw error;
    }
  };

  // 2. Uncaught JS Exceptions (500 Internal Error logic)
  // If JS completely crashes, we could redirect to 500.html
  // But we must be careful not to trigger it for simple console errors.
  window.addEventListener('error', function(event) {
    // If it's a script loading error
    if (event.target.tagName === 'SCRIPT') {
      console.error('Critical script failed to load. Simulating 500 Error.');
      // window.location.href = '/500.html';
    }
  }, true);

  // 3. Global Promise Rejections (500 Error Logic)
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection Captured:', event.reason);
    // If it's a fatal backend disconnect:
    // window.location.href = '/500.html';
  });

  // 4. Missing Image Logic (404 Logic on Assets)
  // Replaces broken images with a default placeholder instead of breaking the layout
  document.addEventListener('error', function(event) {
    if (event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
      // Prevent infinite loop if fallback image is also missing
      if (!event.target.src.includes('favicon.webp')) {
        event.target.src = './assets/images/favicon.webp'; // Fallback
      }
    }
  }, true);
  
  // 5. Intercept internal link clicks to catch 404s dynamically via JS
  // This satisfies the requirement to have JS handle "page not found" 
  // before the browser actually navigates and hits a server error.
  document.addEventListener('click', async function(event) {
    const link = event.target.closest('a');
    
    // Only intercept internal links that are standard HTTP/HTTPS navigations
    if (link && link.href && link.hostname === window.location.hostname && !link.hash && link.target !== '_blank') {
      
      // Don't intercept special protocols like mailto: or tel:
      if (!link.href.startsWith('http')) return;

      event.preventDefault(); // Stop normal navigation
      
      try {
        // Ping the URL to check if it actually exists
        const response = await fetch(link.href, { method: 'HEAD' });
        
        if (response.ok) {
          // Page exists, proceed with normal navigation
          window.location.href = link.href;
        } else {
          // Page does not exist or has an error, show appropriate custom error page
          if (response.status === 404) window.location.href = '/404.html';
          else if (response.status === 403) window.location.href = '/403.html';
          else if (response.status === 401) window.location.href = '/401.html';
          else if (response.status === 400) window.location.href = '/400.html';
          else window.location.href = '/500.html';
        }
      } catch (err) {
        // If fetch completely fails (e.g., network down or absolute garbage URL)
        window.location.href = '/404.html';
      }
    }
  });

  // 6. Utility to manually trigger errors
  window.triggerErrorPage = function(statusCode) {
    const validCodes = [400, 401, 403, 404, 500, 502, 503];
    if (validCodes.includes(statusCode)) {
      window.location.href = `/${statusCode}.html`;
    }
  };
}
