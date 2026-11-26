// Release notes for loopwerk/tag-changelog (.github/workflows/release.yml).
// Commit bodies are included (include_commit_body: true in the workflow).
// Breaking changes come from `feat!:` commits and `BREAKING CHANGE:` footers.
module.exports = {
    types: [
      { types: ["feat", "feature"], label: "✨ New Features" },
      { types: ["fix", "bugfix"], label: "🐛 Bugfixes" },
      { types: ["improvements", "enhancement"], label: "🔨 Improvements" },
      { types: ["perf"], label: "🏎️ Performance Improvements" },
      { types: ["build", "ci"], label: "🏗️ Build System" },
      { types: ["refactor"], label: "🪚 Refactors" },
      { types: ["doc", "docs"], label: "📚 Documentation Changes" },
      { types: ["test", "tests"], label: "🔍 Tests" },
      { types: ["style"], label: "💅 Code Style Changes" },
      { types: ["chore"], label: "🧹 Chores" },
      { types: ["other"], label: "Other Changes" },
    ],

    excludeTypes: ["other"],

    renderTypeSection: function (label, commits, includeCommitBody) {
      let text = `\n## ${label}\n`;
      commits.forEach((commit) => {
        const scope = commit.scope ? `**${commit.scope}**: ` : ''
        text += `- [\`${commit.sha.substring(0, 7)}\`](${commit.url}) ${scope} ${commit.subject}\n`;
        if (commit.body && includeCommitBody) {
          text += commit.body.split("\n").map((line) => `  ${line}`).join("\n") + "\n";
        }
      });
      return text;
    },

    renderNotes: function (notes) {
      let text = `\n## 💥 Breaking Changes\n`;
      notes.forEach((note) => {
        const [first, ...rest] = note.text.split("\n");
        text += `- [\`${note.commit.sha.substring(0, 7)}\`](${note.commit.url}) ${first}\n`;
        rest.forEach((line) => {
          text += line ? `  ${line}\n` : "\n";
        });
      });
      return text;
    },

    renderChangelog: function (release, changes) {
      const now = new Date();
      return `# ${release} - ${now.toISOString().substring(0, 10)}\n` + changes + "\n\n";
    },
  };
