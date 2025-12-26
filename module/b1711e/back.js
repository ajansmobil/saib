function escapeHtml(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  if (typeof value !== "string") {
    value = value === undefined || value === null ? "" : String(value);
  }
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getLangValue(field, lang, fallback) {
  if (!field) {
    return fallback;
  }
  if (typeof field === "string") {
    return field;
  }
  if (field[lang]) {
    return field[lang];
  }
  if (field.tr) {
    return field.tr;
  }
  if (field.en) {
    return field.en;
  }
  return fallback;
}

function slugify(value, fallback) {
  var base = value && typeof value === "string" ? value.toLowerCase() : fallback || "field";
  base = base
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  if (!base) {
    base = "field";
  }
  return base;
}

var lang = json.lang || (typeof page !== "undefined" && page && page.lang) || "tr";
var design = json.desing || {};
var texts = design.texts || {};

var moduleId = "modulex-membership-" + (json.id || Math.floor(Math.random() * 100000));
var modulePrefix = moduleId + "-";

// Renkler ve firebase ayarları artık index.html içinde manuel olarak tanımlı

function getFieldName(field) {
  if (field.name) {
    return field.name;
  }
  var labelText = getLangValue(field.label, lang, "");
  return slugify(labelText, "field");
}

function createInputId(name, suffix) {
  var safeName = name.replace(/[^a-zA-Z0-9_-]+/g, "-");
  if (suffix || suffix === 0) {
    return modulePrefix + safeName + "-" + suffix;
  }
  return modulePrefix + safeName;
}

function renderInputField(field, sizeClass) {
  var name = getFieldName(field);
  var inputId = createInputId(name);
  var inputType = field.inputType || "text";
  var labelText = getLangValue(field.label, lang, "");
  var placeholder = getLangValue(field.placeholder, lang, "");
  var hint = field.hint ? getLangValue(field.hint, lang, "") : "";
  var requiredAttr = field.required ? " required" : "";
  var maxLengthAttr = field.maxLength ? ' maxlength="' + escapeAttr(String(field.maxLength)) + '"' : "";
  var sizeClassName = sizeClass || (field.size === "small" ? "modulex-field-small" : field.size === "wide" ? "modulex-field-wide" : "");

  return (
    '<div class="modulex-field' +
    (sizeClassName ? " " + sizeClassName : "") +
    '">' +
    '<label class="modulex-field-label" for="' +
    escapeAttr(inputId) +
    '">' +
    '<span class="modulex-label-text">' +
    escapeHtml(labelText) +
    "</span>" +
    (hint ? '<span class="modulex-field-hint">' + escapeHtml(hint) + "</span>" : "") +
    "</label>" +
    '<input class="modulex-input" type="' +
    escapeAttr(inputType) +
    '" id="' +
    escapeAttr(inputId) +
    '" name="' +
    escapeAttr(name) +
    '" placeholder="' +
    escapeAttr(placeholder) +
    '"' +
    requiredAttr +
    maxLengthAttr +
    " />" +
    "</div>"
  );
}

function renderTextareaField(field) {
  var name = getFieldName(field);
  var inputId = createInputId(name);
  var labelText = getLangValue(field.label, lang, "");
  var placeholder = getLangValue(field.placeholder, lang, "");
  var hint = field.hint ? getLangValue(field.hint, lang, "") : "";
  var rows = field.rows && Number(field.rows) > 0 ? Number(field.rows) : 4;

  return (
    '<div class="modulex-field modulex-field-wide">' +
    '<label class="modulex-field-label" for="' +
    escapeAttr(inputId) +
    '">' +
    '<span class="modulex-label-text">' +
    escapeHtml(labelText) +
    "</span>" +
    (hint ? '<span class="modulex-field-hint">' + escapeHtml(hint) + "</span>" : "") +
    "</label>" +
    '<textarea class="modulex-textarea" id="' +
    escapeAttr(inputId) +
    '" name="' +
    escapeAttr(name) +
    '" rows="' +
    rows +
    '" placeholder="' +
    escapeAttr(placeholder) +
    '"></textarea>' +
    "</div>"
  );
}

function renderSelectField(field) {
  var name = getFieldName(field);
  var inputId = createInputId(name);
  var labelText = getLangValue(field.label, lang, "");
  var options = Array.isArray(field.options) ? field.options : [];
  var requiredAttr = field.required ? " required" : "";
  var sizeClassName = field.size === "small" ? " modulex-field-small" : field.size === "wide" ? " modulex-field-wide" : "";
  var optionsHtml = "";
  for (var i = 0; i < options.length; i += 1) {
    var option = options[i] || {};
    var optionLabel = getLangValue(option.label, lang, option.value || "");
    var optionValue = option.value || optionLabel;
    optionsHtml +=
      '<option value="' +
      escapeAttr(optionValue) +
      '">' +
      escapeHtml(optionLabel) +
      "</option>";
  }
  return (
    '<div class="modulex-field' +
    sizeClassName +
    '">' +
    '<label class="modulex-field-label" for="' +
    escapeAttr(inputId) +
    '">' +
    '<span class="modulex-label-text">' +
    escapeHtml(labelText) +
    "</span>" +
    "</label>" +
    '<select class="modulex-select" id="' +
    escapeAttr(inputId) +
    '" name="' +
    escapeAttr(name) +
    '"' +
    requiredAttr +
    ">" +
    '<option value="">' +
    escapeHtml(getLangValue(field.placeholder, lang, "")) +
    "</option>" +
    optionsHtml +
    "</select>" +
    "</div>"
  );
}

function renderCheckboxList(field) {
  var name = getFieldName(field);
  var columns = field.columns && Number(field.columns) > 0 ? String(field.columns) : "2";
  var options = Array.isArray(field.options) ? field.options : [];
  var labelText = getLangValue(field.label, lang, "");
  var items = "";
  for (var i = 0; i < options.length; i += 1) {
    var option = options[i] || {};
    var optionLabel = getLangValue(option.label, lang, option.value || "");
    var optionValue = option.value || optionLabel;
    var optionId = createInputId(name, i);
    items +=
      '<label class="modulex-checkbox-item" for="' +
      escapeAttr(optionId) +
      '">' +
      '<input type="checkbox" id="' +
      escapeAttr(optionId) +
      '" name="' +
      escapeAttr(name + "[]") +
      '" value="' +
      escapeAttr(optionValue) +
      '" />' +
      "<span>" +
      escapeHtml(optionLabel) +
      "</span>" +
      "</label>";
  }
  return (
    '<div class="modulex-field modulex-field-checkbox" data-columns="' +
    columns +
    '">' +
    '<div class="modulex-field-label"><span class="modulex-label-text">' +
    escapeHtml(labelText) +
    "</span></div>" +
    '<div class="modulex-checkbox-list">' +
    items +
    "</div>" +
    "</div>"
  );
}

function renderSubheading(field) {
  var text = getLangValue(field.label, lang, "");
  return '<div class="modulex-subheading">' + escapeHtml(text) + "</div>";
}

function renderLineList(field) {
  var count = field.count && Number(field.count) > 0 ? Number(field.count) : 1;
  var labelText = getLangValue(field.label, lang, "");
  var placeholder = getLangValue(field.placeholder, lang, "");
  var name = getFieldName(field);
  var items = "";
  for (var i = 0; i < count; i += 1) {
    var inputName = name + "[" + i + "]";
    var inputId = createInputId(name, i);
    items +=
      '<label class="modulex-line-list-item" for="' +
      escapeAttr(inputId) +
      '">' +
      '<span class="modulex-line-number">' +
      (i + 1) +
      ")</span>" +
      '<input class="modulex-input" type="text" id="' +
      escapeAttr(inputId) +
      '" name="' +
      escapeAttr(inputName) +
      '" placeholder="' +
      escapeAttr(placeholder) +
      '" />' +
      "</label>";
  }
  return (
    '<div class="modulex-line-list-wrapper">' +
    (labelText
      ? '<div class="modulex-field-label modulex-line-list-label"><span class="modulex-label-text">' +
        escapeHtml(labelText) +
        "</span></div>"
      : "") +
    '<div class="modulex-line-list">' +
    items +
    "</div>" +
    "</div>"
  );
}

function renderField(field) {
  if (!field || typeof field !== "object") {
    return "";
  }
  var type = field.type || "text";
  if (type === "text" || type === "line") {
    return renderInputField(field);
  }
  if (type === "textarea" || type === "line-long") {
    return renderTextareaField(field);
  }
  if (type === "select") {
    return renderSelectField(field);
  }
  if (type === "checkbox-list") {
    return renderCheckboxList(field);
  }
  if (type === "subheading") {
    return renderSubheading(field);
  }
  if (type === "line-small") {
    return renderInputField(field, "modulex-field-small");
  }
  if (type === "line-list") {
    return renderLineList(field);
  }
  if (type === "line-wide") {
    return renderInputField(field, "modulex-field-wide");
  }
  return renderInputField(field);
}

function renderRow(row) {
  if (!row || typeof row !== "object") {
    return "";
  }
  if (row.type === "line-list") {
    return renderLineList(row);
  }
  var columns = Array.isArray(row.columns) ? row.columns : [];
  if (!columns.length) {
    return "";
  }
  var columnHtml = "";
  for (var i = 0; i < columns.length; i += 1) {
    columnHtml += renderField(columns[i]);
  }
  return '<div class="modulex-row">' + columnHtml + "</div>";
}

function renderSection(section, index) {
  if (!section || typeof section !== "object") {
    return "";
  }
  var title = getLangValue(section.title, lang, "Section " + (index + 1));
  var subtitle = getLangValue(section.subtitle, lang, "");
  var rows = Array.isArray(section.rows) ? section.rows : [];
  if (!rows.length) {
    return "";
  }
  var rowsHtml = "";
  for (var i = 0; i < rows.length; i += 1) {
    rowsHtml += renderRow(rows[i]);
  }
  var sectionHtml =
    '<section class="modulex-section">' +
    '<div class="modulex-section-header">' +
    escapeHtml(title);
  if (subtitle) {
    sectionHtml += '<div class="modulex-section-subtitle">' + escapeHtml(subtitle) + "</div>";
  }
  sectionHtml +=
    "</div>" +
    '<div class="modulex-section-body">' +
    rowsHtml +
    "</div>" +
    "</section>";
  return sectionHtml;
}

var sections = Array.isArray(json.data) ? json.data : [];
var sectionsHtml = "";
for (var i = 0; i < sections.length; i += 1) {
  sectionsHtml += renderSection(sections[i], i);
}
if (!sectionsHtml) {
  sectionsHtml =
    '<section class="modulex-section"><div class="modulex-section-header">Form İçeriği</div><div class="modulex-section-body"><div class="modulex-row"><div class="modulex-field"><label class="modulex-field-label"><span class="modulex-label-text">Bilgi</span></label><input class="modulex-input" type="text" name="info" /></div></div></div></section>';
}

var organizationText = getLangValue(texts.organization, lang, "");
var formTitle = getLangValue(texts.formTitle, lang, "Üyelik Formu");
var formSubtitle = getLangValue(texts.formSubtitle, lang, "Lütfen formu doldurunuz.");
var formFooter = getLangValue(texts.formFooter, lang, "Formu eksiksiz doldurmanız gerekmektedir.");
var submitLabel = getLangValue(texts.submit, lang, "Gönder");
var submittingMessage = getLangValue(texts.submitting, lang, "Üyelik kaydı yapılıyor...");
var successMessage = getLangValue(texts.success, lang, "Kaydolduğunuz için teşekkürler.");
var thankYouMessage = getLangValue(texts.thankYou, lang, "Kaydolduğunuz için teşekkürler.");
var errorMessage = getLangValue(texts.error, lang, "Bir hata oluştu.");
var loginRequiredMessage = getLangValue(texts.loginRequired, lang, "Giriş yapmalısınız.");
var waitingMessage = getLangValue(texts.waiting, lang, "Form hazırlanıyor, lütfen bekleyiniz.");

// Firebase ayarları artık index.html içinde manuel olarak tanımlı (data-collection, data-status-field, vb.)

html = html
  .replace(new RegExp("{{moduleId}}", "g"), moduleId)
  .replace(new RegExp("{{organization}}", "g"), escapeHtml(organizationText))
  .replace(new RegExp("{{organizationAttr}}", "g"), escapeAttr(organizationText))
  .replace(new RegExp("{{formTitle}}", "g"), escapeHtml(formTitle))
  .replace(new RegExp("{{formTitleAttr}}", "g"), escapeAttr(formTitle))
  .replace(new RegExp("{{formSubtitle}}", "g"), escapeHtml(formSubtitle))
  .replace(new RegExp("{{formFooter}}", "g"), escapeHtml(formFooter))
  .replace(new RegExp("{{formSections}}", "g"), sectionsHtml)
  .replace(new RegExp("{{submitLabel}}", "g"), escapeHtml(submitLabel))
  .replace(new RegExp("{{submittingMessage}}", "g"), escapeAttr(submittingMessage))
  .replace(new RegExp("{{successMessage}}", "g"), escapeAttr(successMessage))
  .replace(new RegExp("{{thankYouMessage}}", "g"), escapeAttr(thankYouMessage))
  .replace(new RegExp("{{errorMessage}}", "g"), escapeAttr(errorMessage))
  .replace(new RegExp("{{loginRequiredMessage}}", "g"), escapeAttr(loginRequiredMessage))
  .replace(new RegExp("{{waitingMessage}}", "g"), escapeAttr(waitingMessage))
  .replace(new RegExp("{{formLang}}", "g"), escapeAttr(lang));

