// This is a file that configures the Netlify CMS to use the local backend when running locally
console.log("Loading Netlify CMS local backend configuration");

// Enable manual initialization
window.CMS_MANUAL_INIT = true;

// Once the DOM is loaded, initialize the CMS
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing Netlify CMS");
  
  const config = {
    backend: {
      name: 'git-gateway',
      branch: 'master',
    },
    load_config_file: false,
    media_folder: 'assets',
    public_folder: '/assets',
    publish_mode: 'editorial_workflow',
    show_preview_links: true,
    collections: [
      {
        name: 'blog',
        label: 'Blog',
        folder: '_posts/',
        create: true,
        slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
        editor: {
          preview: true
        },
        fields: [
          { label: 'Title', name: 'title', widget: 'string' },
          { label: 'Publish Date', name: 'date', widget: 'datetime' },
          { label: 'Categories', name: 'categories', widget: 'list' },
          { label: 'Tags', name: 'tags', widget: 'list' },
          { label: 'Body', name: 'body', widget: 'markdown' }
        ]
      },
    ]
  };
  
  // Check if we're running locally
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.log("Running on localhost, using local backend");
    // Use the local backend
    config.backend = {
      name: 'test-repo',
      local_backend: true
    };
  }
  
  // Initialize the CMS with our configuration
  window.CMS.init({ config });
  
  // Simple event handler to ensure proper entry saving
  window.CMS.registerEventListener({
    name: 'preSave',
    handler: ({ entry }) => {
      // Just return the entry unchanged - the list widget should handle format correctly
      return entry;
    }
  });
  
  // Register preview template
  var PostPreview = createClass({
    render: function() {
      var entry = this.props.entry;
      
      // Format categories for preview
      var categories = [];
      var rawCategories = entry.getIn(['data', 'categories']);
      if (rawCategories) {
        if (typeof rawCategories.toJS === 'function') {
          categories = rawCategories.toJS();
        } else if (Array.isArray(rawCategories)) {
          categories = rawCategories;
        } else {
          categories = [rawCategories];
        }
      }
      
      // Format tags for preview
      var tags = [];
      var rawTags = entry.getIn(['data', 'tags']);
      if (rawTags) {
        if (typeof rawTags.toJS === 'function') {
          tags = rawTags.toJS();
        } else if (Array.isArray(rawTags)) {
          tags = rawTags;
        } else {
          tags = [rawTags];
        }
      }
      
      return h('div', {className: "content"},
        h('h1', {}, entry.getIn(['data', 'title'])),
        h('div', {className: "meta"},
          h('span', {}, "Categories: " + (categories ? categories.join(', ') : '')),
          h('br'),
          h('span', {}, "Tags: " + (tags ? tags.join(', ') : ''))
        ),
        h('div', {className: "post-content"}, this.props.widgetFor('body'))
      );
    }
  });
  
  window.CMS.registerPreviewStyle("https://cdn.jsdelivr.net/npm/minimal-mistakes@4.24.0/assets/css/main.min.css");
  window.CMS.registerPreviewTemplate("blog", PostPreview);
  
  // Simplest auto-save implementation - no status indicator, just functionality
  setTimeout(function() {
    // Auto-save function that preserves focus
    function autoSave() {
      // Only run when in editor
      if (!window.location.href.includes('/collections/')) return;
      
      try {
        // Find the save button
        const saveButton = document.querySelector('button[class*="ToolbarSave"]');
        if (saveButton) {
          // Remember the currently focused element
          const focusedElement = document.activeElement;
          
          // Click the save button
          saveButton.click();
          
          // Return focus to the previously focused element
          if (focusedElement) {
            setTimeout(() => {
              focusedElement.focus();
            }, 100);
          }
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }
    
    // Start auto-save every 60 seconds
    setInterval(autoSave, 60000);
  }, 2000);
});