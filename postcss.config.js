const postcss = require('postcss');

module.exports = {
  plugins: [
    customMerge({})
  ],
};

// Custom postcss-clean plugin to keep only the last declaration of each rule
function customMerge(options) {
  return postcss.plugin('custom-clean', () => {
    return (root, result) => {
      const visitedRules = new Map();

      root.walkRules((rule) => {
        const selector = rule.selector;

        if (!visitedRules.has(selector)) {
          visitedRules.set(selector, rule);
        }
      });

      root.removeAll();

      visitedRules.forEach((rule) => {
        root.append(rule);
      });
    };
  });
}