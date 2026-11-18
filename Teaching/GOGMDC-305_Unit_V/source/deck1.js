const { makeDeck, helpers, save, X0, CW, Y0, BORDER } = require('./lib.js');
const out = process.argv[2];
const { pres, C } = makeDeck('GOGMDC-305 Environment and Ecosystem  ·  Unit V, Part 1: Environmental Monitoring and Management');
pres.title = 'Environmental Monitoring and Management';
const h = helpers(pres, C);
const S = pres.shapes;

// 1
h.title('Environmental Monitoring and Management',
  'Unit V, Part 1\nGOGMDC-305 Environment and Ecosystem  ·  Semester III',
  'Introduce the unit: today we cover how the environment is measured (monitoring) and how human activity is controlled to protect it (management). Part 2 covers programmes and policies.');

// 2
let s = h.slide('Why monitor the environment?', 'Ask students the three questions before showing the answers. Make the point that none of them can be answered by opinion; each needs measured data.');
h.quote(s, '“We cannot manage what we do not measure.”', { y: 1.45, h: 1.0, fs: 26 });
h.cards(s, [
  { b: '?', hd: 'Is the air safe to breathe?', t: 'Only measured PM₂.₅, PM₁₀ and gas levels, compared with standards, can tell us.' },
  { b: '?', hd: 'Is the lake healthy?', t: 'We need dissolved oxygen, BOD, pH and bacteria counts, measured again and again.' },
  { b: '?', hd: 'Is the forest shrinking?', t: 'Satellite images taken every few years show where and how fast forest cover changes.' },
], { y: 2.8, h: 2.6, cols: 3 });
h.note(s, 'Monitoring gives the evidence; management uses that evidence to act.', { y: 5.8 });

// 3
s = h.slide('Lecture roadmap', 'Show the structure of today\'s lecture. Keep this slide up for 30 seconds only.');
h.cards(s, [
  { b: 'A', hd: 'Environmental monitoring', t: 'Meaning, objectives, types, indicators (air, water, noise, soil, biological), methods including remote sensing and GIS, the monitoring process, and monitoring in India' },
  { b: 'B', hd: 'Environmental management', t: 'Meaning, objectives, how monitoring, assessment and management differ, principles, and tools such as EIA, audit, ISO 14001 and LCA' },
  { b: 'C', hd: 'Case study and recap', t: 'A eutrophic lake from monitoring to management; check questions' },
], { y: 1.5, h: 3.4, cols: 3, fs: 18 });

// 4
h.section('Part A: Environmental Monitoring', 'Meaning · objectives · types · indicators · methods · process');

// 5
s = h.slide('What is environmental monitoring?', 'Read the definition slowly. Then explain the three key words using the cards. Stress that one measurement is a survey; monitoring is repeated.');
h.def(s, 'Environmental monitoring', 'is the systematic and repeated observation, measurement and recording of environmental components (air, water, soil, noise and living organisms) over time, to know the present quality of the environment, detect changes, and check whether standards are being met.', { h: 1.55, fs: 18 });
h.cards(s, [
  { b: '1', hd: 'Systematic', t: 'Done by a fixed, scientific method: the same sites, the same instruments, the same procedure every time.' },
  { b: '2', hd: 'Repeated', t: 'Measured again and again. A single measurement is a survey; repetition shows change over time.' },
  { b: '3', hd: 'Compared with standards', t: 'Results are judged against legal or scientific limits, e.g. the National Ambient Air Quality Standards.' },
], { y: 3.25, h: 2.9, cols: 3 });

// 6
s = h.slide('Objectives of environmental monitoring', 'Go through each objective with a quick local example, e.g. baseline before a new industry at Mandideep; early warning of smog in winter.');
h.numbered(s, [
  ['Baseline', 'record the present condition of the environment as a reference point'],
  ['Early detection', 'find pollution and degradation before they become serious'],
  ['Trends', 'show whether environmental quality is improving or getting worse'],
  ['Compliance', 'check whether industries and cities follow laws and standards'],
  ['Early warning', 'alert people to hazards such as smog, floods or algal blooms'],
  ['Planning data', 'provide scientific evidence for planning, policy-making and research'],
  ['Policy evaluation', 'test whether a programme or policy is actually working'],
], { y: 1.45, rowH: 0.72, fs: 17 });

// 7
s = h.slide('Types of environmental monitoring', 'Use the example column. Ask: which type would a Pollution Control Board inspector do? (Compliance.)');
h.table(s, [
  ['Type', 'Meaning', 'Example'],
  ['Baseline monitoring', 'Measuring the environment before a project starts, as a reference point', 'Air and water quality measured before a thermal power plant is built'],
  ['Compliance monitoring', 'Checking whether an activity meets legal standards', 'Pollution Control Board testing a factory\'s effluent'],
  ['Impact monitoring', 'Measuring the effects of an activity after it starts', 'River water quality downstream of an industry'],
  ['Trend (long-term) monitoring', 'Repeating measurements over many years to see long-term change', 'India State of Forest Report, every two years'],
  ['Continuous (real-time) monitoring', 'Automatic instruments record data round the clock', 'Online stations showing hourly AQI'],
], { y: 1.45, colW: [3.0, 4.6, 4.53], fs: 17 });

// 8
s = h.slide('Environmental indicators', 'An indicator is like a thermometer for the environment. Each component has its own set of indicators.');
h.def(s, 'An environmental indicator', 'is a measurable variable that tells us about the condition of an environmental component. Example: dissolved oxygen indicates the health of a water body.', { h: 1.05 });
h.table(s, [
  ['Component', 'What is monitored', 'Main indicators'],
  ['Air', 'Quality of the atmosphere', 'PM₂.₅, PM₁₀, SO₂, NO₂, CO, O₃'],
  ['Water', 'Physical, chemical and biological quality', 'pH, dissolved oxygen (DO), BOD, turbidity, coliform bacteria'],
  ['Soil', 'Fertility and contamination', 'pH, organic carbon, nutrients, heavy metals'],
  ['Noise', 'Sound levels', 'Decibels, dB(A)'],
  ['Biological', 'Health of ecosystems', 'Species diversity, forest cover, bio-indicator species'],
], { y: 2.75, colW: [2.2, 4.3, 5.63], fs: 16 });

// 9 AQI
s = h.slide('Air quality monitoring and the AQI', 'Show the AQI bands. Ask students to check today\'s Bhopal AQI on the SAMEER app or the CPCB website.');
h.def(s, 'The Air Quality Index (AQI)', 'is a single number that converts the concentrations of several air pollutants into one easy-to-understand value and colour category. India launched its National AQI in 2014.', { h: 1.05 });
const aqi = [
  ['0–50', 'Good', '00A65A', 'FFFFFF'], ['51–100', 'Satisfactory', '9BC45F', '1F2A1F'], ['101–200', 'Moderately polluted', 'F2D300', '1F2A1F'],
  ['201–300', 'Poor', 'F08A24', '1F2A1F'], ['301–400', 'Very poor', 'D7262E', 'FFFFFF'], ['401–500', 'Severe', '7E0023', 'FFFFFF'],
];
const bw = CW / 6;
aqi.forEach(([r, c, f, t], i) => {
  s.addShape(S.RECTANGLE, { x: X0 + i * bw, y: 2.75, w: bw, h: 1.25, fill: { color: f }, line: { color: 'FFFFFF', width: 1.5 } });
  s.addText([{ text: r, options: { bold: true, fontSize: 20, breakLine: true } }, { text: c, options: { fontSize: 15 } }],
    { x: X0 + i * bw + 0.08, y: 2.75, w: bw - 0.16, h: 1.25, color: t, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
});
h.bullets(s, [
  ['Eight pollutants in the National AQI:', 'PM₁₀, PM₂.₅, NO₂, SO₂, CO, O₃, NH₃ and lead (Pb).'],
  ['How it is measured:', 'manual stations (sampled and sent to a laboratory) and Continuous Ambient Air Quality Monitoring Stations (CAAQMS), which report every hour.'],
  ['Why it matters:', 'the AQI turns complex chemistry into a public health message anyone can understand.'],
], { y: 4.3, h: 2.3, fs: 16 });

// 10 Water
s = h.slide('Water quality monitoring: DO and BOD', 'This links back to the oxygen cycle lecture. Draw the chain on the board: organic waste → microbes → oxygen used up → fish die.');
h.def(s, 'Dissolved oxygen (DO)', 'is the amount of oxygen gas dissolved in water, in mg/L. High DO means healthy water that can support fish.', { w: 5.9, h: 1.5, fs: 16 });
h.def(s, 'Biological oxygen demand (BOD)', 'is the amount of oxygen microorganisms need to decompose the organic matter in water. High BOD means more organic pollution.', { x: X0 + 6.23, w: 5.9, h: 1.5, fs: 16 });
h.flow(s, ['Sewage or organic waste enters water', 'Microbes decompose it', 'BOD rises', 'DO falls', 'Fish and aquatic life die'], { y: 3.3, h: 1.2, fs: 15 });
h.bullets(s, [
  ['Other water indicators:', 'pH, turbidity, temperature, nitrates and phosphates, coliform bacteria (sewage contamination).'],
  ['Simple rule for students:', 'high DO and low BOD = clean water; low DO and high BOD = polluted water.'],
], { y: 4.85, h: 1.6, fs: 16 });

// 11 Noise & soil
s = h.slide('Noise and soil monitoring', 'Point out that silence zones (100 m around hospitals, schools and courts) have the strictest limits.');
s.addText('Noise limits in India (Noise Pollution Rules, 2000)', { x: X0, y: 1.4, w: 6.6, h: 0.45, fontSize: 17, bold: true, color: C.text2, isTextBox: true, margin: 0 });
h.table(s, [
  ['Zone', 'Day dB(A)', 'Night dB(A)'],
  ['Industrial', '75', '70'],
  ['Commercial', '65', '55'],
  ['Residential', '55', '45'],
  ['Silence zone', '50', '40'],
], { y: 1.95, w: 6.6, colW: [3.0, 1.8, 1.8], fs: 16 });
h.bullets(s, [
  ['Noise', 'is unwanted or harmful sound. It is measured in decibels on the A-weighted scale, dB(A), which matches human hearing.'],
], { x: X0, y: 4.75, w: 6.6, h: 1.4, fs: 15 });
s.addShape(S.ROUNDED_RECTANGLE, { x: 7.6, y: 1.4, w: 5.13, h: 4.9, fill: { color: C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
s.addText('Soil monitoring', { x: 7.85, y: 1.55, w: 4.6, h: 0.5, fontSize: 18, bold: true, color: C.text2, isTextBox: true, margin: 0 });
h.bullets(s, [
  ['pH:', 'acidity or alkalinity of soil'],
  ['Organic carbon:', 'indicator of soil fertility'],
  ['Nutrients:', 'nitrogen (N), phosphorus (P), potassium (K)'],
  ['Heavy metals:', 'lead, cadmium, chromium near industries and dumpsites'],
  ['Example:', 'the Soil Health Card scheme tests farmers\' soil and recommends fertiliser doses'],
], { x: 7.85, y: 2.15, w: 4.65, h: 4.0, fs: 15 });

// 12 Bio-indicators
s = h.slide('Bio-indicators: nature as a monitoring instrument', 'Bio-indicators are cheap and show the combined, long-term effect of pollution, which instruments may miss.');
h.def(s, 'A bio-indicator', 'is a living organism whose presence, absence or condition shows the quality of the environment.', { h: 0.95 });
h.cards(s, [
  { b: '1', hd: 'Lichens', t: 'Disappear from trees where air has high sulphur dioxide (SO₂). Rich lichen growth means clean air.' },
  { b: '2', hd: 'Aquatic insects', t: 'Mayfly and stonefly larvae live only in clean, well-oxygenated streams. Their absence signals pollution.' },
  { b: '3', hd: 'Algal blooms', t: 'Green, scummy water shows excess nutrients (nitrates, phosphates) from fertiliser or sewage.' },
  { b: '4', hd: 'Fish kills', t: 'Large numbers of dead fish signal very low dissolved oxygen.' },
], { y: 2.6, h: 3.6, cols: 4, fs: 15 });

// 13 Methods
s = h.slide('Methods of environmental monitoring', 'Four methods. The next slide expands on remote sensing because it is central to geography.');
h.cards(s, [
  { b: '1', hd: 'Ground-based (field)', t: 'Direct sampling at a site and analysis in a laboratory, or automatic instruments such as continuous air-quality stations.' },
  { b: '2', hd: 'Remote sensing and GIS', t: 'Satellites and aircraft observe large areas repeatedly; GIS stores, analyses and maps the data.' },
  { b: '3', hd: 'Biomonitoring', t: 'Using living organisms (bio-indicators) to judge environmental quality, e.g. aquatic insects for river health.' },
  { b: '4', hd: 'Citizen monitoring', t: 'Students, local people and NGOs record observations, e.g. air-quality apps, bird counts, lake-watch groups.' },
], { y: 1.5, h: 4.6, cols: 2, fs: 16 });

// 14 RS & GIS
s = h.slide('Remote sensing and GIS in monitoring', 'Good place to show your own Bhopal maps (LST, land use, LCZ) as a real example from your research.');
h.def(s, 'Remote sensing', 'is collecting information about the Earth\'s surface without physical contact, using sensors on satellites or aircraft.', { w: 5.9, h: 1.3, fs: 16 });
h.def(s, 'GIS (Geographic Information System)', 'is a computer system for storing, analysing and mapping spatial data.', { x: X0 + 6.23, w: 5.9, h: 1.3, fs: 16 });
h.table(s, [
  ['What is monitored', 'Example satellite or product'],
  ['Forest-cover loss and land-use change', 'Landsat, Sentinel-2, Resourcesat; Forest Survey of India reports'],
  ['Urban expansion', 'Landsat time series, built-up area maps'],
  ['Land surface temperature and urban heat islands', 'Landsat thermal band, MODIS'],
  ['Surface water and wetlands', 'Sentinel-1 radar, Sentinel-2'],
  ['Forest fires', 'MODIS and VIIRS active-fire alerts'],
  ['Air pollution (NO₂)', 'Sentinel-5P (TROPOMI)'],
], { y: 2.95, colW: [5.6, 6.53], fs: 14 });
h.note(s, 'remote sensing covers large and inaccessible areas repeatedly at low cost.', { y: 6.4, h: 0.45 });

// 15 Process
s = h.slide('The monitoring process: six steps', 'Walk through the steps with the lake example in the bottom row.');
const sw = h.flow(s, ['Identify the problem', 'Select indicators and sites', 'Sample and collect data', 'Analyse and measure', 'Interpret against standards', 'Report, act, follow up'], { y: 1.55, h: 1.25, fs: 15 });
const ex = ['Lake smells; fish are dying', 'DO, BOD, pH, coliform at 10 points', 'Water samples every month', 'Laboratory tests for DO and BOD', 'BOD is far above the bathing-water limit', 'Stop sewage inflow; test again'];
s.addText('Example: a polluted city lake', { x: X0, y: 3.1, w: CW, h: 0.45, fontSize: 17, bold: true, color: C.accent3, isTextBox: true, margin: 0 });
ex.forEach((t, i) => {
  const bx = X0 + i * (sw + 0.4);
  s.addShape(S.ROUNDED_RECTANGLE, { x: bx, y: 3.65, w: sw, h: 2.0, fill: { color: C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
  s.addText(t, { x: bx + 0.12, y: 3.7, w: sw - 0.24, h: 1.9, fontSize: 15, color: C.text1, valign: 'middle', align: 'center', isTextBox: true, margin: 0 });
});
h.note(s, 'monitoring is a cycle; after action, we monitor again to check whether it worked.', { y: 6.0 });

// 16 India
s = h.slide('Environmental monitoring in India', 'CPCB = Central Pollution Control Board; SPCB = State Pollution Control Board (in MP, the MPPCB).');
h.table(s, [
  ['Programme or standard', 'Agency', 'What it does'],
  ['National Air Quality Monitoring Programme (NAMP)', 'CPCB with SPCBs', 'Manual air-quality monitoring stations in cities across India'],
  ['Continuous monitoring stations (CAAQMS)', 'CPCB, SPCBs', 'Real-time, hourly air-quality data and the public AQI'],
  ['National Water Quality Monitoring Programme (NWMP)', 'CPCB with SPCBs', 'Quality of rivers, lakes and groundwater'],
  ['National Ambient Air Quality Standards (2009)', 'CPCB', 'Legal limits for 12 air pollutants'],
  ['India State of Forest Report', 'Forest Survey of India', 'Forest and tree cover from satellite data, every two years'],
], { y: 1.5, colW: [4.4, 2.6, 5.13], fs: 17 });

// 17
h.section('Part B: Environmental Management', 'Meaning · objectives · principles · tools');

// 18
s = h.slide('What is environmental management?', 'Key idea: we do not manage nature; we manage human behaviour towards nature.');
h.def(s, 'Environmental management', 'is the planning, organisation and control of human activities so that the environment is protected, natural resources are used wisely, and development remains sustainable.', { h: 1.3, fs: 18 });
h.quote(s, 'It manages how humans interact with nature, not nature itself.', { y: 2.95, h: 0.8, fs: 20 });
s.addText('Objectives', { x: X0, y: 4.0, w: CW, h: 0.45, fontSize: 18, bold: true, color: C.text2, isTextBox: true, margin: 0 });
h.bullets(s, [
  'Prevent and control pollution',
  'Conserve forests, water, soil and biodiversity',
  'Restore degraded ecosystems',
], { x: X0, y: 4.5, w: 5.9, h: 2.0, fs: 16 });
h.bullets(s, [
  'Balance development with environmental protection',
  'Reduce risks from environmental hazards',
  'Involve people in environmental decisions',
], { x: X0 + 6.23, y: 4.5, w: 5.9, h: 2.0, fs: 16 });

// 19
s = h.slide('Monitoring, assessment and management', 'This is the most important distinction in this lecture. Use the lake example: measure BOD, judge it is 3 times the limit, then build a sewage treatment plant.');
const items = [
  ['Monitoring', 'Collecting data on the environment', 'What is the condition?', 'Measure BOD in the lake every month'],
  ['Assessment', 'Interpreting data and judging how serious the problem is', 'How serious is the problem?', 'BOD is three times the permitted limit'],
  ['Management', 'Taking action to prevent, control or restore', 'What should we do about it?', 'Divert sewage and build a treatment plant'],
];
const cw3 = (CW - 2 * 0.55) / 3;
items.forEach(([hd, m, q, e], i) => {
  const cx = X0 + i * (cw3 + 0.55);
  s.addShape(S.ROUNDED_RECTANGLE, { x: cx, y: 1.5, w: cw3, h: 4.6, fill: { color: i === 2 ? C.text2 : C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
  const fg = i === 2 ? C.background1 : C.text1, hc = i === 2 ? C.accent2 : C.text2;
  s.addText(hd, { x: cx + 0.25, y: 1.65, w: cw3 - 0.5, h: 0.6, fontSize: 24, bold: true, color: hc, isTextBox: true, margin: 0 });
  s.addText(m, { x: cx + 0.25, y: 2.3, w: cw3 - 0.5, h: 1.0, fontSize: 16, color: fg, valign: 'top', isTextBox: true, margin: 0 });
  s.addText(q, { x: cx + 0.25, y: 3.35, w: cw3 - 0.5, h: 0.9, fontSize: 18, italic: true, bold: true, color: i === 2 ? C.accent2 : C.accent3, valign: 'top', isTextBox: true, margin: 0 });
  s.addText([{ text: 'Example: ', options: { bold: true } }, { text: e }], { x: cx + 0.25, y: 4.4, w: cw3 - 0.5, h: 1.5, fontSize: 15, color: fg, valign: 'top', isTextBox: true, margin: 0 });
  if (i < 2) s.addShape(S.RIGHT_ARROW, { x: cx + cw3 + 0.1, y: 3.6, w: 0.35, h: 0.3, fill: { color: C.accent2 }, line: { color: C.accent2 } });
});

// 20
s = h.slide('Principles of environmental management', 'Indian courts have upheld the precautionary and polluter pays principles, notably in Vellore Citizens\' Welfare Forum v. Union of India (1996).');
h.cards(s, [
  { b: '1', hd: 'Sustainable development', t: '“Development that meets the needs of the present without compromising the ability of future generations to meet their own needs” (Brundtland Report, 1987).' },
  { b: '2', hd: 'Precautionary principle', t: 'If an activity may cause serious environmental harm, act to prevent it even before full scientific proof is available.' },
  { b: '3', hd: 'Polluter pays principle', t: 'Whoever causes pollution must pay the cost of controlling it and repairing the damage.' },
  { b: '4', hd: 'Public participation', t: 'Local people must be informed and consulted, e.g. through public hearings in EIA.' },
], { y: 1.45, h: 4.55, cols: 2, fs: 16 });
h.note(s, 'Indian courts upheld the precautionary and polluter pays principles in the Vellore Citizens\' Welfare Forum case (1996).', { y: 6.25 });

// 21 EIA
s = h.slide('Tool 1: Environmental Impact Assessment (EIA)', 'Category A projects are appraised by the Central Government (MoEFCC); Category B by the State-level authority (SEIAA).');
h.def(s, 'Environmental Impact Assessment (EIA)', 'is a process of predicting and evaluating the likely environmental effects of a proposed project before it is approved, so that harmful impacts can be avoided or reduced.', { h: 1.2 });
h.flow(s, ['Screening', 'Scoping', 'Baseline study', 'Impact prediction', 'Mitigation plan'], { y: 2.9, h: 0.95, fs: 16, lastAccent: false });
h.flow(s, ['Public hearing', 'Appraisal', 'Decision', 'Post-project monitoring'], { x: X0 + 1.2, w: CW - 2.4, y: 4.2, h: 0.95, fs: 16 });
h.bullets(s, [
  ['In India:', 'governed by the EIA Notification, 2006. Category A projects are approved by the Central Government; Category B projects by the State.'],
  ['Link to monitoring:', 'EIA begins with baseline monitoring and ends with post-project monitoring.'],
], { y: 5.45, h: 1.3, fs: 15 });

// 22 Other tools
s = h.slide('Other tools of environmental management', 'Mention that many Indian industries and universities now display ISO 14001 certification.');
h.table(s, [
  ['Tool', 'Meaning', 'Example'],
  ['Environmental audit', 'A systematic check of how well an organisation follows environmental rules and manages its waste, energy and emissions', 'Annual environmental statement submitted by industries to the SPCB'],
  ['Environmental Management System (ISO 14001)', 'An international standard giving organisations a framework to manage their environmental responsibilities', 'ISO 14001-certified factories and campuses'],
  ['Life Cycle Assessment (LCA)', 'Studying a product\'s environmental impact from raw material to disposal (“cradle to grave”)', 'Comparing plastic and cloth bags'],
  ['Economic instruments', 'Using money to change behaviour: taxes, fines, incentives, carbon credits', 'Fines on polluters; subsidies for solar energy'],
], { y: 1.5, colW: [3.3, 5.3, 3.53], fs: 16 });

// 23 Case
s = h.slide('Case study: eutrophication of a city lake', 'Connects the nitrogen cycle, oxygen cycle and this unit. Ask students to name each stage: monitoring, assessment or management.');
h.numbered(s, [
  ['Problem', 'fertiliser runoff and untreated sewage enter the lake; green scum appears'],
  ['Monitoring', 'monthly samples show low DO, high BOD, high nitrates and phosphates'],
  ['Assessment', 'values exceed standards; risk of fish kills and unsafe drinking water'],
  ['Management action', 'divert sewage to treatment plants, control runoff, remove weeds, create buffer zones'],
  ['Follow-up monitoring', 'continue sampling to check whether DO rises and BOD falls'],
], { y: 1.5, rowH: 0.85, fs: 17 });
h.note(s, 'Bhopal\'s Upper Lake (Bhojtal) faces exactly this pressure; we return to it in Part 2.', { y: 6.0 });

// 24 Recap
s = h.slide('Recap: the management cycle', 'Summarise the whole lecture with this cycle.');
h.flow(s, ['MONITOR\ncollect data', 'ASSESS\njudge severity', 'MANAGE\ntake action', 'MONITOR AGAIN\ncheck results'], { y: 1.5, h: 1.3, fs: 16 });
h.bullets(s, [
  ['Monitoring', 'is systematic, repeated measurement. Its types are baseline, compliance, impact, trend and continuous.'],
  ['Indicators:', 'AQI and PM for air; DO and BOD for water; dB(A) for noise; bio-indicators such as lichens.'],
  ['Methods:', 'ground-based, remote sensing and GIS, biomonitoring, citizen monitoring.'],
  ['Management', 'means planning and controlling human activity. Its principles are sustainable development, precaution, polluter pays and participation.'],
  ['Tools:', 'EIA, environmental audit, ISO 14001, Life Cycle Assessment, economic instruments.'],
], { y: 3.15, h: 3.5, fs: 16 });

// 25 Questions
s = h.slide('Check your understanding', 'Answers: (1) see slide 5; (2) more organic pollution, less oxygen; (3) compliance; (4) lichens; (5) slide 19; (6) before.');
h.numbered(s, [
  ['Define environmental monitoring. How is it different from a one-time survey?', ''],
  ['What does a high BOD value tell us about a water body?', ''],
  ['A Pollution Control Board tests a factory\'s effluent. Which type of monitoring is this?', ''],
  ['Name a bio-indicator of sulphur dioxide pollution in the air.', ''],
  ['Distinguish between monitoring, assessment and management.', ''],
  ['Is an EIA carried out before or after a project is approved? Why?', ''],
], { y: 1.5, rowH: 0.78, fs: 17 });

save(pres, out).then(() => console.log('wrote', out));
