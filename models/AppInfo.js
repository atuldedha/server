const mongoose = require("mongoose");

const AppInfoSchema = new mongoose.Schema({
  headerNavValues: {
    type: Array,
  },
  displayQueryText: {
    type: String,
  },
  searchBarPlaceholderText: {
    type: String,
  },
  subjectSectionData: {
    type: Array,
  },
  reviewSectionData: {
    type: Object,
  },
  courseSectionData: {
    type: Array,
  },
  whyBrainjeeSectionData: {
    type: Array,
  },
  footerSectionData: {
    type: Object,
  },
  logoUrl: {
    type: String,
  },
});

module.exports = mongoose.model("appInfo", AppInfoSchema);
