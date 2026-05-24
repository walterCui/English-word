window._vocabChunks = window._vocabChunks || [];
window._vocabManifest = [
  { file: "vocab-001-100.js", label: "第1批", range: [1, 100] }
];
window._vocabManifest.forEach(function(entry) {
  document.write('<script src="' + entry.file + '"><\/script>');
});
