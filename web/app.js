const state = {
  step: 'setup',
  locale: 'en',
  file: null,
  conversionId: null,
  generatedConfig: null,
  rawConfig: null,
  valid: false,
};

const translations = {
  en: {
    'brand.home': 'KNX Project to JSON home', 'brand.title': 'KNX Project', 'brand.subtitle': 'to JSON', 'brand.footer': 'KNX Project to JSON', 'brand.footerDetail': 'Local conversion workbench',
    'language.label': 'Interface language', 'status.checking': 'Checking backend', 'status.checkingConnection': 'Checking connection', 'status.contacting': 'Contacting the local conversion service...', 'status.waiting': 'Waiting', 'status.ready': 'Backend ready', 'status.unavailable': 'Backend unavailable', 'status.parserUnavailable': 'The Python parser is not available.',
    'steps.label': 'Conversion steps', 'steps.setup': 'Setup', 'steps.setupDetail': 'Backend check', 'steps.import': 'Import', 'steps.importDetail': 'Choose project', 'steps.convert': 'Convert', 'steps.convertDetail': 'Parse and map', 'steps.review': 'Review', 'steps.reviewDetail': 'Edit JSON', 'steps.export': 'Export', 'steps.exportDetail': 'Save files',
    'hero.eyebrow': 'LOCAL CONFIGURATION WORKBENCH', 'hero.title': 'Turn an ETS project into a configuration you can trust.', 'hero.description': 'Parse the project with the Python backend, review the generated communication objects, and leave with a clean JSON file ready for your application.', 'hero.note.first': 'Five deliberate steps.', 'hero.note.second': 'One portable result.',
    'setup.kicker': 'STEP 01 / ENVIRONMENT', 'setup.title': 'Make sure the parser is ready.', 'setup.description': 'Conversion happens locally through the Python service. Your browser is the control surface, not the parser.', 'setup.backendStatus': 'Backend status', 'setup.environment': 'Environment', 'setup.firstTime': 'First-time setup', 'setup.installDescription': 'From the project folder, install the parser and start the local service.',
    'environment.python': 'Python', 'environment.parser': 'Parser', 'environment.uploadLimit': 'Upload limit',
    'common.optional': 'optional', 'actions.checkAgain': 'Check again', 'actions.continueImport': 'Continue to import', 'actions.back': 'Back', 'actions.startConversion': 'Start conversion', 'actions.format': 'Format', 'actions.reset': 'Reset', 'actions.validate': 'Validate JSON', 'actions.continueExport': 'Continue to export', 'actions.downloadConfiguration': 'Download configuration', 'actions.downloadRaw': 'Download raw JSON', 'actions.copyJson': 'Copy final JSON', 'actions.backToEditor': 'Back to editor', 'actions.newProject': 'Convert another project',
    'import.kicker': 'STEP 02 / PROJECT INPUT', 'import.title': 'Bring in your ETS project.', 'import.descriptionBefore': 'Select a local', 'import.descriptionAfter': 'file. It will be held in a temporary backend directory only for this conversion.', 'import.dropTitle': 'Drop an ETS project here', 'import.dropBefore': 'or choose a', 'import.dropAfter': 'file from your computer', 'import.password': 'Password', 'import.passwordPlaceholder': 'Only for protected projects', 'import.showPassword': 'Show password', 'import.hidePassword': 'Hide password', 'import.projectLanguage': 'Project language', 'import.projectDefault': 'Use project default', 'import.privacy': 'Files and passwords stay within this local web service. Passwords are never displayed in results or logs.',
    'convert.kicker': 'STEP 03 / CONVERSION', 'convert.title': 'Building your configuration.', 'convert.description': 'The parser is working through the project in a temporary workspace.', 'convert.stageUpload': 'Uploading project', 'convert.stageParse': 'Parsing ETS data', 'convert.stageWrite': 'Writing parser output', 'convert.stageMap': 'Mapping communication objects', 'convert.stageValidate': 'Validating configuration', 'convert.waiting': 'Waiting', 'convert.working': 'Working', 'convert.complete': 'Complete',
    'review.kicker': 'STEP 04 / REVIEW', 'review.title': 'Shape the JSON before it leaves.', 'review.description': 'Edit the generated application configuration directly. The validator checks the same contract used by the backend.', 'review.find': 'Find in JSON', 'review.searchPlaceholder': 'Search IDs, addresses, DPTs', 'review.editorLabel': 'Editable KNX configuration JSON', 'review.rawOutput': 'Inspect raw parser output',
    'validation.notValidated': 'Not validated', 'validation.editPrompt': 'Edit the JSON, then validate before exporting.', 'validation.invalidJson': 'Invalid JSON', 'validation.needsAttention': 'Needs attention', 'validation.valid': 'Valid configuration', 'validation.syntaxError': 'Syntax error: {message}', 'validation.ready': '{count} communication objects are ready to export.', 'validation.formatChanged': 'Formatting changed the document. Validate it before exporting.', 'validation.reset': 'Reset restored the generated result. Validate it before exporting.',
    'summary.mediaType': 'Media type', 'summary.physicalAddress': 'Physical address', 'summary.objects': 'Communication objects', 'summary.groupAddresses': 'Unique group addresses', 'summary.readable': 'Readable', 'summary.writable': 'Writable', 'summary.units': 'With units', 'summary.dptTypes': 'DPT types',
    'export.kicker': 'STEP 05 / EXPORT', 'export.title': 'Your configuration is ready.', 'export.description': 'Download the edited application file, keep the raw parser output for inspection, or start another project.', 'export.applicationOutput': 'APPLICATION OUTPUT', 'export.applicationDescription': 'Validated, editable configuration for your KNX application.', 'export.parserOutput': 'PARSER OUTPUT', 'export.parserDescription': 'Complete raw project data from xknxproject', 'export.copied': 'Copied to clipboard',
    'errors.projectFile': 'Choose an ETS .knxproj file.', 'errors.fileSize': 'That file is larger than the 50 MB upload limit.', 'errors.startBackend': 'Start web_app.py, then check again.', 'errors.conversion': 'The conversion could not be completed.', 'errors.password': 'The KNX project password is invalid or missing.', 'errors.notFound': 'The conversion result is no longer available.', 'errors.search': 'Search IDs, addresses, DPTs',
    'projectLanguage.default': 'Use project default', 'projectLanguage.enUS': 'English (US)', 'projectLanguage.deDE': 'German (Germany)', 'projectLanguage.frFR': 'French (France)',
  },
  'zh-CN': {
    'brand.home': 'KNX 项目转 JSON 首页', 'brand.title': 'KNX 项目', 'brand.subtitle': '转 JSON', 'brand.footer': 'KNX 项目转 JSON', 'brand.footerDetail': '本地转换工作台', 'language.label': '界面语言', 'status.checking': '正在检查后端', 'status.checkingConnection': '正在检查连接', 'status.contacting': '正在连接本地转换服务...', 'status.waiting': '等待中', 'status.ready': '后端已就绪', 'status.unavailable': '后端不可用', 'status.parserUnavailable': 'Python 解析器不可用。',
    'steps.label': '转换步骤', 'steps.setup': '设置', 'steps.setupDetail': '检查后端', 'steps.import': '导入', 'steps.importDetail': '选择项目', 'steps.convert': '转换', 'steps.convertDetail': '解析并映射', 'steps.review': '检查', 'steps.reviewDetail': '编辑 JSON', 'steps.export': '导出', 'steps.exportDetail': '保存文件', 'hero.eyebrow': '本地配置工作台', 'hero.title': '将 ETS 项目转换为值得信赖的配置。', 'hero.description': '使用 Python 后端解析项目，检查生成的通信对象，并获得可供应用使用的整洁 JSON 文件。', 'hero.note.first': '五个清晰步骤。', 'hero.note.second': '一个便携结果。',
    'setup.kicker': '步骤 01 / 环境', 'setup.title': '确认解析器已准备就绪。', 'setup.description': '转换通过本地 Python 服务完成。浏览器是操作界面，而不是解析器。', 'setup.backendStatus': '后端状态', 'setup.environment': '环境', 'setup.firstTime': '首次设置', 'setup.installDescription': '在项目目录中安装解析器并启动本地服务。', 'environment.python': 'Python', 'environment.parser': '解析器', 'environment.uploadLimit': '上传上限', 'common.optional': '可选',
    'actions.checkAgain': '再次检查', 'actions.continueImport': '继续导入', 'actions.back': '返回', 'actions.startConversion': '开始转换', 'actions.format': '格式化', 'actions.reset': '重置', 'actions.validate': '验证 JSON', 'actions.continueExport': '继续导出', 'actions.downloadConfiguration': '下载配置', 'actions.downloadRaw': '下载原始 JSON', 'actions.copyJson': '复制最终 JSON', 'actions.backToEditor': '返回编辑器', 'actions.newProject': '转换另一个项目',
    'import.kicker': '步骤 02 / 项目输入', 'import.title': '导入 ETS 项目。', 'import.descriptionBefore': '选择本地', 'import.descriptionAfter': '文件。该文件仅会在本次转换期间保存在后端临时目录中。', 'import.dropTitle': '将 ETS 项目拖放到这里', 'import.dropBefore': '或从电脑中选择', 'import.dropAfter': '文件', 'import.password': '密码', 'import.passwordPlaceholder': '仅用于受保护的项目', 'import.showPassword': '显示密码', 'import.hidePassword': '隐藏密码', 'import.projectLanguage': '项目语言', 'import.privacy': '文件和密码仅保留在本地服务中。密码不会显示在结果或日志中。',
    'convert.kicker': '步骤 03 / 转换', 'convert.title': '正在构建配置。', 'convert.description': '解析器正在临时工作区中处理项目。', 'convert.stageUpload': '上传项目', 'convert.stageParse': '解析 ETS 数据', 'convert.stageWrite': '写入解析器输出', 'convert.stageMap': '映射通信对象', 'convert.stageValidate': '验证配置', 'convert.waiting': '等待中', 'convert.working': '处理中', 'convert.complete': '已完成',
    'review.kicker': '步骤 04 / 检查', 'review.title': '在导出前整理 JSON。', 'review.description': '直接编辑生成的应用配置。验证器使用与后端相同的配置约定。', 'review.find': '在 JSON 中查找', 'review.searchPlaceholder': '搜索 ID、地址、DPT', 'review.editorLabel': '可编辑的 KNX 配置 JSON', 'review.rawOutput': '查看原始解析器输出', 'validation.notValidated': '尚未验证', 'validation.editPrompt': '编辑 JSON，然后在导出前进行验证。', 'validation.invalidJson': 'JSON 无效', 'validation.needsAttention': '需要处理', 'validation.valid': '配置有效', 'validation.syntaxError': '语法错误：{message}', 'validation.ready': '{count} 个通信对象可以导出。', 'validation.formatChanged': '格式化改变了文档，请在导出前验证。', 'validation.reset': '已恢复生成结果，请在导出前验证。',
    'summary.mediaType': '媒体类型', 'summary.physicalAddress': '物理地址', 'summary.objects': '通信对象', 'summary.groupAddresses': '唯一组地址', 'summary.readable': '可读', 'summary.writable': '可写', 'summary.units': '含单位', 'summary.dptTypes': 'DPT 类型', 'export.kicker': '步骤 05 / 导出', 'export.title': '配置已准备就绪。', 'export.description': '下载编辑后的应用文件，保留原始解析输出，或开始另一个项目。', 'export.applicationOutput': '应用输出', 'export.applicationDescription': '已验证、可编辑的 KNX 应用配置。', 'export.parserOutput': '解析器输出', 'export.parserDescription': '来自 xknxproject 的完整原始项目数据', 'export.copied': '已复制到剪贴板', 'errors.projectFile': '请选择 ETS .knxproj 文件。', 'errors.fileSize': '该文件超过 50 MB 上传限制。', 'errors.startBackend': '请启动 web_app.py，然后再次检查。', 'errors.conversion': '无法完成转换。', 'errors.password': 'KNX 项目密码无效或缺失。', 'errors.notFound': '转换结果已不可用。', 'errors.search': '搜索 ID、地址、DPT', 'projectLanguage.default': '使用项目默认值', 'projectLanguage.enUS': '英语（美国）', 'projectLanguage.deDE': '德语（德国）', 'projectLanguage.frFR': '法语（法国）',
  },
  'zh-TW': {
    'brand.home': 'KNX 專案轉 JSON 首頁', 'brand.title': 'KNX 專案', 'brand.subtitle': '轉 JSON', 'brand.footer': 'KNX 專案轉 JSON', 'brand.footerDetail': '本地轉換工作台', 'language.label': '介面語言', 'status.checking': '正在檢查後端', 'status.checkingConnection': '正在檢查連線', 'status.contacting': '正在連線本地轉換服務...', 'status.waiting': '等待中', 'status.ready': '後端已就緒', 'status.unavailable': '後端無法使用', 'status.parserUnavailable': 'Python 解析器無法使用。',
    'steps.label': '轉換步驟', 'steps.setup': '設定', 'steps.setupDetail': '檢查後端', 'steps.import': '匯入', 'steps.importDetail': '選擇專案', 'steps.convert': '轉換', 'steps.convertDetail': '解析並映射', 'steps.review': '檢查', 'steps.reviewDetail': '編輯 JSON', 'steps.export': '匯出', 'steps.exportDetail': '儲存檔案', 'hero.eyebrow': '本地配置工作台', 'hero.title': '將 ETS 專案轉換成值得信賴的配置。', 'hero.description': '使用 Python 後端解析專案，檢查產生的通訊物件，並取得可供應用程式使用的整潔 JSON 檔案。', 'hero.note.first': '五個清晰步驟。', 'hero.note.second': '一個可攜結果。',
    'setup.kicker': '步驟 01 / 環境', 'setup.title': '確認解析器已準備就緒。', 'setup.description': '轉換透過本地 Python 服務完成。瀏覽器是操作介面，而不是解析器。', 'setup.backendStatus': '後端狀態', 'setup.environment': '環境', 'setup.firstTime': '首次設定', 'setup.installDescription': '在專案目錄中安裝解析器並啟動本地服務。', 'environment.python': 'Python', 'environment.parser': '解析器', 'environment.uploadLimit': '上傳上限', 'common.optional': '選填',
    'actions.checkAgain': '再次檢查', 'actions.continueImport': '繼續匯入', 'actions.back': '返回', 'actions.startConversion': '開始轉換', 'actions.format': '格式化', 'actions.reset': '重設', 'actions.validate': '驗證 JSON', 'actions.continueExport': '繼續匯出', 'actions.downloadConfiguration': '下載配置', 'actions.downloadRaw': '下載原始 JSON', 'actions.copyJson': '複製最終 JSON', 'actions.backToEditor': '返回編輯器', 'actions.newProject': '轉換另一個專案',
    'import.kicker': '步驟 02 / 專案輸入', 'import.title': '匯入 ETS 專案。', 'import.descriptionBefore': '選擇本地', 'import.descriptionAfter': '檔案。該檔案僅會在本次轉換期間保存在後端暫存目錄中。', 'import.dropTitle': '將 ETS 專案拖放到這裡', 'import.dropBefore': '或從電腦中選擇', 'import.dropAfter': '檔案', 'import.password': '密碼', 'import.passwordPlaceholder': '僅用於受保護的專案', 'import.showPassword': '顯示密碼', 'import.hidePassword': '隱藏密碼', 'import.projectLanguage': '專案語言', 'import.privacy': '檔案和密碼僅保留在本地服務中。密碼不會顯示在結果或記錄中。',
    'convert.kicker': '步驟 03 / 轉換', 'convert.title': '正在建立配置。', 'convert.description': '解析器正在暫存工作區中處理專案。', 'convert.stageUpload': '上傳專案', 'convert.stageParse': '解析 ETS 資料', 'convert.stageWrite': '寫入解析器輸出', 'convert.stageMap': '映射通訊物件', 'convert.stageValidate': '驗證配置', 'convert.waiting': '等待中', 'convert.working': '處理中', 'convert.complete': '已完成',
    'review.kicker': '步驟 04 / 檢查', 'review.title': '在匯出前整理 JSON。', 'review.description': '直接編輯產生的應用程式配置。驗證器使用與後端相同的配置約定。', 'review.find': '在 JSON 中尋找', 'review.searchPlaceholder': '搜尋 ID、位址、DPT', 'review.editorLabel': '可編輯的 KNX 配置 JSON', 'review.rawOutput': '查看原始解析器輸出', 'validation.notValidated': '尚未驗證', 'validation.editPrompt': '編輯 JSON，然後在匯出前進行驗證。', 'validation.invalidJson': 'JSON 無效', 'validation.needsAttention': '需要處理', 'validation.valid': '配置有效', 'validation.syntaxError': '語法錯誤：{message}', 'validation.ready': '{count} 個通訊物件可以匯出。', 'validation.formatChanged': '格式化改變了文件，請在匯出前驗證。', 'validation.reset': '已恢復產生結果，請在匯出前驗證。',
    'summary.mediaType': '媒體類型', 'summary.physicalAddress': '實體位址', 'summary.objects': '通訊物件', 'summary.groupAddresses': '唯一群組位址', 'summary.readable': '可讀', 'summary.writable': '可寫', 'summary.units': '含單位', 'summary.dptTypes': 'DPT 類型', 'export.kicker': '步驟 05 / 匯出', 'export.title': '配置已準備就緒。', 'export.description': '下載編輯後的應用程式檔案，保留原始解析輸出，或開始另一個專案。', 'export.applicationOutput': '應用程式輸出', 'export.applicationDescription': '已驗證、可編輯的 KNX 應用程式配置。', 'export.parserOutput': '解析器輸出', 'export.parserDescription': '來自 xknxproject 的完整原始專案資料', 'export.copied': '已複製到剪貼簿', 'errors.projectFile': '請選擇 ETS .knxproj 檔案。', 'errors.fileSize': '該檔案超過 50 MB 上傳限制。', 'errors.startBackend': '請啟動 web_app.py，然後再次檢查。', 'errors.conversion': '無法完成轉換。', 'errors.password': 'KNX 專案密碼無效或缺失。', 'errors.notFound': '轉換結果已不可用。', 'errors.search': '搜尋 ID、位址、DPT', 'projectLanguage.default': '使用專案預設值', 'projectLanguage.enUS': '英文（美國）', 'projectLanguage.deDE': '德文（德國）', 'projectLanguage.frFR': '法文（法國）',
  },
};

const stageKeys = ['convert.stageUpload', 'convert.stageParse', 'convert.stageWrite', 'convert.stageMap', 'convert.stageValidate'];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function t(key, variables = {}) {
  const english = translations.en[key] || key;
  const message = translations[state.locale]?.[key] || english;
  return message.replace(/\{(\w+)\}/g, (_, variable) => String(variables[variable] ?? `{${variable}}`));
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.title = `${t('brand.title')} ${t('brand.subtitle')}`;
  $$('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  $$('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  $$('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
  const projectLanguageKeys = {
    '': 'projectLanguage.default',
    'en-US': 'projectLanguage.enUS',
    'de-DE': 'projectLanguage.deDE',
    'fr-FR': 'projectLanguage.frFR',
  };
  [...$('#project-language').options].forEach((option) => {
    if (projectLanguageKeys[option.value]) option.textContent = t(projectLanguageKeys[option.value]);
  });
  $('#ui-language').value = state.locale;
  if (state.step === 'convert') {
    $$('.conversion-stages li').forEach((item, index) => {
      item.querySelector('b').textContent = t(stageKeys[index]);
    });
  }
}

function detectLocale() {
  const saved = localStorage.getItem('knx-ui-language');
  if (saved && translations[saved]) return saved;
  const browserLocale = (navigator.language || 'en').toLowerCase();
  if (browserLocale.startsWith('zh-tw') || browserLocale.startsWith('zh-hk') || browserLocale.startsWith('zh-mo')) return 'zh-TW';
  if (browserLocale.startsWith('zh')) return 'zh-CN';
  return 'en';
}

function setLocale(locale, persist = true) {
  state.locale = translations[locale] ? locale : 'en';
  if (persist) localStorage.setItem('knx-ui-language', state.locale);
  applyTranslations();
  if ($('#validation-status').classList.contains('valid')) {
    setValidation('valid', t('validation.valid'), t('validation.ready', { count: $('#summary-grid .summary-card:nth-child(3) strong').textContent }));
  }
}

function showAlert(message) {
  const alert = $('#global-alert');
  alert.textContent = message;
  alert.classList.remove('hidden');
}

function clearAlert() {
  $('#global-alert').classList.add('hidden');
}

function setStep(step) {
  state.step = step;
  $$('.panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === step));
  $$('.step').forEach((button) => {
    const isActive = button.dataset.step === step;
    button.classList.toggle('active', isActive);
    button.classList.toggle('done', ['setup', 'import', 'convert', 'review'].indexOf(button.dataset.step) < ['setup', 'import', 'convert', 'review', 'export'].indexOf(step));
    button.setAttribute('aria-current', isActive ? 'step' : 'false');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setHeaderStatus(ready, label) {
  const dot = $('.status-dot');
  dot.classList.toggle('ready', ready);
  dot.classList.toggle('error', ready === false);
  $('#header-status span:last-child').textContent = label;
}

function localizeError(message) {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('password protected') || normalized.includes('password is invalid')) return t('errors.password');
  if (normalized.includes('conversion not found') || normalized.includes('result is no longer available')) return t('errors.notFound');
  if (normalized.includes('knx project not found')) return t('errors.projectFile');
  return message;
}

async function checkHealth() {
  $('#health-title').textContent = t('status.checkingConnection');
  $('#health-detail').textContent = t('status.contacting');
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.ready) throw new Error('The Python parser is not available.');
    $('#health-orb').classList.add('ready');
    $('#health-orb').classList.remove('error');
    $('#health-title').textContent = t('status.ready');
    $('#health-detail').textContent = t('setup.description');
    $('#python-version').textContent = data.python_version;
    $('#parser-version').textContent = data.xknxproject_version;
    setHeaderStatus(true, t('status.ready'));
  } catch (error) {
    $('#health-orb').classList.add('error');
    $('#health-orb').classList.remove('ready');
    $('#health-title').textContent = t('status.unavailable');
    $('#health-detail').textContent = error.message || t('errors.startBackend');
    $('#python-version').textContent = t('status.unavailable');
    $('#parser-version').textContent = t('status.unavailable');
    setHeaderStatus(false, t('status.unavailable'));
  }
}

function setFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.knxproj')) {
    showAlert(t('errors.projectFile'));
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    showAlert(t('errors.fileSize'));
    return;
  }
  clearAlert();
  state.file = file;
  $('#file-meta').textContent = `${file.name}  /  ${formatBytes(file.size)}`;
  $('#file-meta').classList.remove('hidden');
  $('#convert-button').disabled = false;
  $('#dropzone').classList.add('has-file');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function updateStage(index, status) {
  const item = $(`[data-stage="${index}"]`);
  if (!item) return;
  item.classList.toggle('active', status === 'active');
  item.classList.toggle('done', status === 'done');
  item.querySelector('small').textContent = status === 'done' ? t('convert.complete') : status === 'active' ? t('convert.working') : t('convert.waiting');
  const progress = status === 'done' ? ((index + 1) / stageKeys.length) * 100 : (index / stageKeys.length) * 100 + 5;
  $('#progress-bar').style.width = `${Math.min(progress, 100)}%`;
  $('#progress-percent').textContent = `${Math.round(Math.min(progress, 100))}%`;
}

function resetStages() {
  $$('.conversion-stages li').forEach((item) => {
    item.classList.remove('active', 'done');
    item.querySelector('small').textContent = t('convert.waiting');
  });
  $('#progress-bar').style.width = '0%';
  $('#progress-percent').textContent = '0%';
}

async function convertProject(event) {
  event.preventDefault();
  if (!state.file) return;
  clearAlert();
  resetStages();
  setStep('convert');
  updateStage(0, 'active');
  const form = new FormData();
  form.append('project', state.file, state.file.name);
  form.append('password', $('#project-password').value);
  form.append('language', $('#project-language').value);
  try {
    const responsePromise = fetch('/api/convert', { method: 'POST', body: form });
    await pause(220);
    updateStage(0, 'done'); updateStage(1, 'active');
    await pause(300);
    updateStage(1, 'done'); updateStage(2, 'active');
    await pause(280);
    updateStage(2, 'done'); updateStage(3, 'active');
    await pause(260);
    const response = await responsePromise;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Conversion failed.');
    updateStage(3, 'done'); updateStage(4, 'active');
    await pause(260);
    updateStage(4, 'done');
    state.conversionId = data.conversion_id;
    state.generatedConfig = data.config;
    state.rawConfig = null;
    state.valid = false;
    renderReview(data.config, data.summary);
    setStep('review');
  } catch (error) {
    showAlert(localizeError(error.message) || t('errors.conversion'));
    setStep('import');
  }
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function renderReview(config, summary) {
  const text = JSON.stringify(config, null, 2);
  $('#json-editor').value = text;
  $('#raw-preview').textContent = 'Raw parser output is available after the conversion completes.';
  renderEditor();
  renderSummary(summary);
  setValidation('pending', t('validation.notValidated'), t('validation.editPrompt'));
  $('#to-export').disabled = true;
  fetch(`/api/result/${state.conversionId}`).then((response) => response.json()).then((data) => {
    if (data.config) {
      state.rawConfig = data;
      $('#raw-preview').textContent = JSON.stringify(data.raw || {}, null, 2);
    }
  }).catch(() => {});
}

function renderSummary(summary) {
  const values = [
    [t('summary.mediaType'), summary.media_type],
    [t('summary.physicalAddress'), summary.physical_address],
    [t('summary.objects'), summary.communication_objects],
    [t('summary.groupAddresses'), summary.unique_group_addresses],
    [t('summary.readable'), summary.readable],
    [t('summary.writable'), summary.writable],
    [t('summary.units'), summary.with_units],
    [t('summary.dptTypes'), Object.keys(summary.dpt_counts || {}).length],
  ];
  $('#summary-grid').innerHTML = values.map(([label, value]) => `<div class="summary-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join('');
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function highlightJson(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/(&quot;(?:\\.|[^&])*?&quot;)(\s*:)/g, '<span class="token-key">$1</span>$2')
    .replace(/(&quot;(?:\\.|[^&])*?&quot;)/g, '<span class="token-string">$1</span>')
    .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="token-number">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span class="token-literal">$1</span>')
    .replace(/([{}[\],:])/g, '<span class="token-punctuation">$1</span>');
}

function renderEditor() {
  const text = $('#json-editor').value;
  $('#highlight').innerHTML = `${highlightJson(text)}\n`;
  const lines = text.split('\n').length;
  $('#line-numbers').textContent = Array.from({ length: lines }, (_, index) => index + 1).join('\n');
}

function syncEditorScroll() {
  $('#highlight').scrollTop = $('#json-editor').scrollTop;
  $('#highlight').scrollLeft = $('#json-editor').scrollLeft;
  $('#line-numbers').scrollTop = $('#json-editor').scrollTop;
}

function setValidation(kind, label, message) {
  const status = $('#validation-status');
  status.className = `validation ${kind}`;
  status.textContent = label;
  const messageBox = $('#validation-message');
  messageBox.className = `editor-message ${kind === 'invalid' ? 'invalid' : kind === 'valid' ? 'valid' : ''}`;
  messageBox.textContent = message;
}

async function validateJson() {
  let config;
  try {
    config = JSON.parse($('#json-editor').value);
  } catch (error) {
    state.valid = false;
    setValidation('invalid', t('validation.invalidJson'), t('validation.syntaxError', { message: error.message }));
    $('#to-export').disabled = true;
    return;
  }
  try {
    const response = await fetch('/api/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Configuration is invalid.');
    state.valid = true;
    setValidation('valid', t('validation.valid'), t('validation.ready', { count: data.summary.communication_objects }));
    renderSummary(data.summary);
    $('#to-export').disabled = false;
  } catch (error) {
    state.valid = false;
    setValidation('invalid', t('validation.needsAttention'), localizeError(error.message));
    $('#to-export').disabled = true;
  }
}

function formatJson() {
  try {
    $('#json-editor').value = JSON.stringify(JSON.parse($('#json-editor').value), null, 2);
    renderEditor();
    setValidation('pending', t('validation.notValidated'), t('validation.formatChanged'));
    state.valid = false;
    $('#to-export').disabled = true;
  } catch (error) {
    setValidation('invalid', t('validation.invalidJson'), t('validation.syntaxError', { message: error.message }));
  }
}

function resetApplication() {
  state.step = 'setup'; state.file = null; state.conversionId = null; state.generatedConfig = null; state.rawConfig = null; state.valid = false;
  $('#project-file').value = '';
  $('#file-meta').classList.add('hidden');
  $('#convert-button').disabled = true;
  $('#json-editor').value = '';
  $('#raw-preview').textContent = '';
  clearAlert();
  setStep('setup');
  checkHealth();
}

function downloadBlob(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = filename; link.click();
  URL.revokeObjectURL(link.href);
}

function searchJson() {
  const query = $('#json-search').value;
  const editor = $('#json-editor');
  if (!query) return;
  const start = editor.selectionEnd;
  const index = editor.value.toLowerCase().indexOf(query.toLowerCase(), start);
  const fallback = editor.value.toLowerCase().indexOf(query.toLowerCase());
  const position = index === -1 ? fallback : index;
  if (position >= 0) { editor.focus(); editor.setSelectionRange(position, position + query.length); }
}

$('#health-check').addEventListener('click', checkHealth);
$('#project-file').addEventListener('change', (event) => setFile(event.target.files[0]));
$('#dropzone').addEventListener('dragover', (event) => { event.preventDefault(); $('#dropzone').classList.add('dragging'); });
$('#dropzone').addEventListener('dragleave', () => $('#dropzone').classList.remove('dragging'));
$('#dropzone').addEventListener('drop', (event) => { event.preventDefault(); $('#dropzone').classList.remove('dragging'); setFile(event.dataTransfer.files[0]); });
$('#import-form').addEventListener('submit', convertProject);
$('#toggle-password').addEventListener('click', () => { const input = $('#project-password'); input.type = input.type === 'password' ? 'text' : 'password'; });
$('#json-editor').addEventListener('input', renderEditor);
$('#json-editor').addEventListener('scroll', syncEditorScroll);
$('#validate-json').addEventListener('click', validateJson);
$('#format-json').addEventListener('click', formatJson);
$('#reset-json').addEventListener('click', () => { if (state.generatedConfig) { $('#json-editor').value = JSON.stringify(state.generatedConfig, null, 2); renderEditor(); setValidation('pending', t('validation.notValidated'), t('validation.reset')); state.valid = false; $('#to-export').disabled = true; } });
$('#json-search').addEventListener('keydown', (event) => { if (event.key === 'Enter') searchJson(); });
$('#to-export').addEventListener('click', () => { if (state.valid) setStep('export'); });
$('#download-config').addEventListener('click', () => { if (state.valid) downloadBlob('knxConfig.json', $('#json-editor').value); });
$('#download-temp').addEventListener('click', () => { if (state.conversionId) window.location.href = `/api/download/${state.conversionId}/temp`; });
$('#copy-json').addEventListener('click', async () => { await navigator.clipboard.writeText($('#json-editor').value); $('#copy-status').textContent = t('export.copied'); setTimeout(() => { $('#copy-status').textContent = ''; }, 1800); });
$$('[data-next]').forEach((button) => button.addEventListener('click', () => setStep(button.dataset.next)));
$$('[data-prev]').forEach((button) => button.addEventListener('click', () => setStep(button.dataset.prev)));
$$('.step').forEach((button) => button.addEventListener('click', () => { if (button.dataset.step === 'setup' || state.generatedConfig || button.dataset.step === 'import') setStep(button.dataset.step); }));
$$('[data-action="reset"]').forEach((button) => button.addEventListener('click', resetApplication));

state.locale = detectLocale();
$('#ui-language').addEventListener('change', (event) => setLocale(event.target.value));
applyTranslations();
checkHealth();
