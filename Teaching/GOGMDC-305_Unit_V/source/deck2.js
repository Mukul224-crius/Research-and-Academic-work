const { makeDeck, helpers, save, X0, CW, Y0, BORDER } = require('./lib.js');
const out = process.argv[2];
const { pres, C } = makeDeck('GOGMDC-305 Environment and Ecosystem  ·  Unit V, Part 2: Environmental Programmes and Policies');
pres.title = 'Environmental Programmes and Policies';
const h = helpers(pres, C);
const S = pres.shapes;

// 1
h.title('Environmental Programmes and Policies',
  'Global · National · Local\nUnit V, Part 2  ·  GOGMDC-305 Environment and Ecosystem  ·  Semester III',
  'Recall Part 1: monitoring tells us the condition of the environment. Today: the rules, institutions and programmes that act on that information, at global, national and local levels.');

// 2
let s = h.slide('Why do we need environmental policy?', 'Ask: who owns the air over Bhopal? Who is responsible for cleaning the Ganga, which crosses five states? Policy answers these questions.');
h.cards(s, [
  { b: '1', hd: 'Pollution crosses borders', t: 'Smoke, greenhouse gases and river pollution do not stop at state or national boundaries.' },
  { b: '2', hd: 'Shared resources', t: 'Air, oceans, rivers and biodiversity belong to everyone, so no single person protects them.' },
  { b: '3', hd: 'Pressure of development', t: 'Industry, cities and agriculture grow fast and need rules to limit damage.' },
  { b: '4', hd: 'Need for institutions', t: 'Someone must set standards, monitor, give permissions and punish violations.' },
], { y: 1.45, h: 3.7, cols: 4, fs: 16 });
h.quote(s, '“Think globally, act locally.”', { y: 5.45, h: 0.95, fs: 24 });

// 3
s = h.slide('Key definitions', 'Distinguish policy (the intention and rules) from programme (the scheme on the ground). Governance is the whole system.');
h.def(s, 'Environmental policy', 'is a set of principles, laws and decisions adopted by a government or organisation to protect the environment and use natural resources sustainably.', { y: 1.45, h: 1.35 });
h.def(s, 'An environmental programme', 'is a practical scheme or action plan, with targets, funds and agencies, through which a policy is carried out. Example: the National Clean Air Programme.', { y: 3.0, h: 1.35 });
h.def(s, 'Environmental governance', 'is the system of institutions, laws, treaties and processes through which environmental decisions are made and implemented, from the United Nations to the Gram Panchayat.', { y: 4.55, h: 1.35 });

// 4 three levels
s = h.slide('Three levels of environmental policy', 'This slide is the map of the lecture. Each level depends on the next one for implementation.');
const lv = [
  ['GLOBAL', 'United Nations, UNEP, treaties and conferences', 'Stockholm 1972, Rio 1992, Paris Agreement 2015, SDGs'],
  ['NATIONAL', 'Constitution, Parliament, MoEFCC, CPCB, courts', 'Environment (Protection) Act 1986, NAPCC 2008, NCAP 2019'],
  ['LOCAL', 'State boards, municipal bodies, panchayats, communities', 'City Clean Air Action Plan, lake conservation, waste management'],
];
const cw3 = (CW - 2 * 0.55) / 3;
lv.forEach(([t, who, ex], i) => {
  const cx = X0 + i * (cw3 + 0.55);
  s.addShape(S.ROUNDED_RECTANGLE, { x: cx, y: 1.5, w: cw3, h: 4.7, fill: { color: i === 0 ? C.text2 : C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
  const fg = i === 0 ? C.background1 : C.text1;
  s.addText(t, { x: cx + 0.25, y: 1.65, w: cw3 - 0.5, h: 0.7, fontSize: 26, bold: true, color: i === 0 ? C.accent2 : C.text2, fontFace: 'Cambria', isTextBox: true, margin: 0 });
  s.addText([{ text: 'Who: ', options: { bold: true } }, { text: who }], { x: cx + 0.25, y: 2.5, w: cw3 - 0.5, h: 1.5, fontSize: 17, color: fg, valign: 'top', isTextBox: true, margin: 0 });
  s.addText([{ text: 'Examples: ', options: { bold: true } }, { text: ex }], { x: cx + 0.25, y: 4.0, w: cw3 - 0.5, h: 2.0, fontSize: 17, color: fg, valign: 'top', isTextBox: true, margin: 0 });
  if (i < 2) s.addShape(S.RIGHT_ARROW, { x: cx + cw3 + 0.1, y: 3.7, w: 0.35, h: 0.3, fill: { color: C.accent2 }, line: { color: C.accent2 } });
});

// 5
h.section('Part A: Global Level', 'International conferences, treaties and goals');

// 6 timeline
s = h.slide('Milestones in global environmental policy', 'Use this timeline as the backbone of the global section. Each milestone gets its own slide next.');
const tl = [
  ['1971', 'Ramsar Convention', 'Wetlands'],
  ['1972', 'Stockholm Conference', 'Birth of UNEP'],
  ['1987', 'Brundtland Report and Montreal Protocol', 'Sustainable development; ozone'],
  ['1992', 'Rio Earth Summit', 'Agenda 21, UNFCCC, CBD'],
  ['1997', 'Kyoto Protocol', 'Binding cuts for developed countries'],
  ['2015', 'Paris Agreement and SDGs', 'Climate action by all; 17 goals'],
];
const ty = 3.1, step = CW / tl.length;
s.addShape(S.LINE, { x: X0 + step / 2, y: ty, w: CW - step, h: 0, line: { color: C.accent5, width: 2 } });
tl.forEach(([yr, ev, sub], i) => {
  const cx = X0 + i * step + step / 2;
  s.addText(yr, { x: cx - step / 2, y: 1.6, w: step, h: 0.8, fontSize: 32, bold: true, color: C.accent3, fontFace: 'Cambria', align: 'center', valign: 'bottom', isTextBox: true, margin: 0 });
  s.addShape(S.OVAL, { x: cx - 0.2, y: ty - 0.2, w: 0.4, h: 0.4, fill: { color: C.accent2 }, line: { color: C.text2, width: 2 } });
  s.addText(ev, { x: cx - step / 2 + 0.08, y: 3.55, w: step - 0.16, h: 1.2, fontSize: 17, bold: true, color: C.text2, align: 'center', valign: 'top', isTextBox: true, margin: 0 });
  s.addText(sub, { x: cx - step / 2 + 0.08, y: 4.8, w: step - 0.16, h: 1.1, fontSize: 15, color: C.text1, align: 'center', valign: 'top', isTextBox: true, margin: 0 });
});

// 7 Stockholm
s = h.slide('Stockholm Conference, 1972 and UNEP', 'Indira Gandhi was the only head of government apart from the host to attend. Her speech linked poverty and environment.');
h.bullets(s, [
  ['What:', 'the UN Conference on the Human Environment, Stockholm, Sweden, 5–16 June 1972; the first global meeting on the environment.'],
  ['Outcome:', 'the Stockholm Declaration and the creation of the United Nations Environment Programme (UNEP), headquartered in Nairobi, Kenya.'],
  ['India\'s voice:', 'Prime Minister Indira Gandhi linked environmental problems with poverty and development.'],
  ['Significance:', 'the environment became an international issue for the first time.'],
], { x: X0, y: 1.5, w: 7.4, h: 3.4, fs: 17 });
h.stat(s, '5 June', 'World Environment Day, celebrated every year since 1974 in memory of the Stockholm Conference', 8.4, 1.5, 4.33, 2.5);
h.def(s, 'UNEP', 'is the UN agency that coordinates environmental work: it monitors the global environment, publishes the Global Environment Outlook, and helps countries build laws and treaties.', { y: 5.05, h: 1.25, fs: 16 });

// 8 Brundtland
s = h.slide('Brundtland Report, 1987: sustainable development', 'Write the definition on the board; it is the most-quoted definition in environmental studies and is frequently asked in exams.');
h.quote(s, '“Development that meets the needs of the present without compromising the ability of future generations to meet their own needs.”', { y: 1.45, h: 1.5, fs: 24, by: 'Our Common Future, World Commission on Environment and Development (chaired by Gro Harlem Brundtland), 1987' });
s.addText('The three pillars of sustainable development', { x: X0, y: 3.2, w: CW, h: 0.5, fontSize: 18, bold: true, color: C.text2, isTextBox: true, margin: 0 });
h.cards(s, [
  { b: '1', hd: 'Environment', t: 'Protect ecosystems, resources and biodiversity.' },
  { b: '2', hd: 'Economy', t: 'Allow growth, jobs and income.' },
  { b: '3', hd: 'Society', t: 'Ensure equity, health and well-being for all, now and in future.' },
], { y: 3.8, h: 2.4, cols: 3, fs: 16 });

// 9 Ramsar + Montreal
s = h.slide('Two early successes: Ramsar and Montreal', 'Montreal links to the ozone part of the oxygen cycle lecture. Ramsar links to Bhopal\'s Bhoj Wetland.');
const two = [
  ['Ramsar Convention, 1971', 'An international treaty for the conservation and wise use of wetlands of international importance.', ['Signed at Ramsar, Iran', 'India has been a party since 1982', 'Bhopal\'s Upper and Lower Lakes together form the Bhoj Wetland Ramsar site (2002)']],
  ['Montreal Protocol, 1987', 'An international treaty to phase out the production and use of ozone-depleting substances such as CFCs.', ['Ratified by every UN member country', 'Widely called the most successful environmental treaty', 'The ozone layer is slowly recovering']],
];
two.forEach(([hd, d, pts], i) => {
  const cx = X0 + i * 6.23;
  s.addShape(S.ROUNDED_RECTANGLE, { x: cx, y: 1.5, w: 5.9, h: 4.8, fill: { color: C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
  s.addText(hd, { x: cx + 0.25, y: 1.65, w: 5.4, h: 0.6, fontSize: 22, bold: true, color: C.text2, fontFace: 'Cambria', isTextBox: true, margin: 0 });
  s.addText([{ text: 'Definition: ', options: { bold: true, color: C.accent3 } }, { text: d }], { x: cx + 0.25, y: 2.35, w: 5.4, h: 1.4, fontSize: 16, color: C.text1, valign: 'top', isTextBox: true, margin: 0 });
  h.bullets(s, pts, { x: cx + 0.25, y: 3.8, w: 5.4, h: 2.3, fs: 16 });
});

// 10 Rio
s = h.slide('Rio Earth Summit, 1992', 'Explain CBDR with an analogy: everyone in a house must clean up, but the person who made the most mess does more.');
s.addText('UN Conference on Environment and Development (UNCED), Rio de Janeiro, Brazil', { x: X0, y: 1.35, w: CW, h: 0.45, fontSize: 17, italic: true, color: C.accent5, isTextBox: true, margin: 0 });
h.cards(s, [
  { b: '1', hd: 'Agenda 21', t: 'Action plan for sustainable development in the 21st century, including at local level (Local Agenda 21).' },
  { b: '2', hd: 'Rio Declaration', t: '27 principles, including the precautionary and polluter pays principles.' },
  { b: '3', hd: 'UNFCCC', t: 'Climate change convention opened for signature.' },
  { b: '4', hd: 'CBD', t: 'Convention on Biological Diversity opened for signature.' },
  { b: '5', hd: 'Forest Principles', t: 'Non-binding statement on sustainable management of forests.' },
], { y: 1.95, h: 2.65, cols: 5, fs: 15, hfs: 16 });
h.def(s, 'Common but differentiated responsibilities (CBDR)', 'means all countries share responsibility for protecting the global environment, but developed countries must do more because they caused most of the historical pollution and have more resources.', { y: 4.85, h: 1.4, fs: 17 });

// 11 UNFCCC & CBD
s = h.slide('UNFCCC and the Convention on Biological Diversity', 'COP = Conference of the Parties. COP21 (Paris, 2015) produced the Paris Agreement.');
h.def(s, 'UNFCCC', 'is the United Nations Framework Convention on Climate Change, a treaty whose aim is to stabilise greenhouse gas concentrations at a level that prevents dangerous human interference with the climate system.', { w: 5.9, h: 2.0, fs: 16 });
h.def(s, 'The CBD', 'is the Convention on Biological Diversity (1992), an international treaty for conserving biodiversity, using it sustainably, and sharing its benefits fairly.', { x: X0 + 6.23, w: 5.9, h: 2.0, fs: 16 });
h.bullets(s, [
  ['Meets every year', 'as the Conference of the Parties (COP).'],
  ['Agreements under it:', 'the Kyoto Protocol (1997) and the Paris Agreement (2015).'],
  ['India\'s role:', 'argues for CBDR and climate finance for developing countries.'],
], { x: X0, y: 3.65, w: 5.9, h: 2.6, fs: 16 });
h.bullets(s, [
  ['Objective 1:', 'conservation of biological diversity.'],
  ['Objective 2:', 'sustainable use of its components.'],
  ['Objective 3:', 'fair and equitable sharing of benefits from genetic resources.'],
  ['In India:', 'implemented through the Biological Diversity Act, 2002.'],
], { x: X0 + 6.23, y: 3.65, w: 5.9, h: 2.6, fs: 16 });

// 12 Kyoto vs Paris
s = h.slide('Kyoto Protocol vs Paris Agreement', 'Key exam point: Kyoto = top-down, binding targets for developed countries only. Paris = bottom-up, every country sets its own target (NDC).');
h.table(s, [
  ['Feature', 'Kyoto Protocol', 'Paris Agreement'],
  ['Adopted', '1997, Kyoto, Japan', '2015, COP21, Paris'],
  ['In force', '2005', '2016'],
  ['Who has targets', 'Developed (Annex I) countries only', 'All countries, developed and developing'],
  ['Type of target', 'Legally binding emission cuts set from the top', 'Nationally Determined Contributions (NDCs) set by each country'],
  ['Main goal', 'Cut emissions about 5% below 1990 levels in 2008–2012', 'Keep warming well below 2 °C; pursue efforts to limit it to 1.5 °C'],
  ['Key mechanisms', 'Emissions trading, Clean Development Mechanism, Joint Implementation', 'NDCs updated every five years; global stocktake every five years'],
], { y: 1.5, colW: [2.6, 4.75, 4.78], fs: 16 });

// 13 India commitments
s = h.slide('India\'s climate commitments under Paris', 'Net zero 2070 was announced at COP26, Glasgow (2021); the two 2030 targets come from India\'s updated NDC (2022).');
h.stat(s, '2070', 'Target year for net-zero emissions (announced at COP26, Glasgow, 2021)', X0, 1.6, 3.85, 3.0);
h.stat(s, '45%', 'Reduction in emissions intensity of GDP by 2030, from 2005 levels', X0 + 4.14, 1.6, 3.85, 3.0);
h.stat(s, '50%', 'Share of electric power capacity from non-fossil sources by 2030', X0 + 8.28, 1.6, 3.85, 3.0);
h.def(s, 'Net-zero emissions', 'means the greenhouse gases a country emits are balanced by the amount it removes from the atmosphere, e.g. through forests.', { y: 4.95, h: 1.15, fs: 16 });

// 14 SDGs
s = h.slide('Sustainable Development Goals (SDGs), 2015', 'SDG 11 (sustainable cities) is especially relevant to urban geography.');
h.def(s, 'The SDGs', 'are 17 global goals, with 169 targets, adopted by the United Nations in 2015 as the 2030 Agenda for Sustainable Development. These six relate most directly to the environment:', { h: 1.2, fs: 17 });
h.cards(s, [
  { b: '6', hd: 'Clean water and sanitation' }, { b: '7', hd: 'Affordable and clean energy' }, { b: '11', hd: 'Sustainable cities and communities' },
  { b: '13', hd: 'Climate action' }, { b: '14', hd: 'Life below water' }, { b: '15', hd: 'Life on land' },
], { y: 2.9, h: 3.2, cols: 3, hfs: 19 });

// 15
h.section('Part B: National Level (India)', 'Constitution · laws · institutions · policies · programmes');

// 16 Constitution
s = h.slide('Constitutional provisions', 'Article 21 was expanded by the Supreme Court in cases such as Subhash Kumar v. State of Bihar (1991).');
h.cards(s, [
  { b: '21', hd: 'Article 21: Right to Life', t: 'The Supreme Court has interpreted the right to life to include the right to a clean and healthy environment.' },
  { b: '48A', hd: 'Article 48A: Duty of the State', t: 'A Directive Principle (added by the 42nd Amendment, 1976): the State shall protect and improve the environment and safeguard forests and wildlife.' },
  { b: '51A', hd: 'Article 51A(g): Duty of citizens', t: 'A Fundamental Duty: every citizen must protect and improve the natural environment and have compassion for living creatures.' },
], { y: 1.5, h: 3.6, cols: 3, fs: 18, hfs: 18 });

// 17 Laws
s = h.slide('Major environmental laws of India', 'The Forest (Conservation) Act was amended in 2023 and renamed the Van (Sanrakshan Evam Samvardhan) Adhiniyam.');
h.table(s, [
  ['Year', 'Act', 'Main purpose'],
  ['1972', 'Wildlife (Protection) Act', 'Protection of wild animals and plants; national parks and sanctuaries'],
  ['1974', 'Water (Prevention and Control of Pollution) Act', 'Control of water pollution; created the CPCB and SPCBs'],
  ['1980', 'Forest (Conservation) Act', 'Restricts use of forest land for non-forest purposes'],
  ['1981', 'Air (Prevention and Control of Pollution) Act', 'Control of air pollution'],
  ['1986', 'Environment (Protection) Act', 'An umbrella law giving the Centre wide powers to protect the environment'],
  ['2002', 'Biological Diversity Act', 'Implements the CBD; National Biodiversity Authority'],
  ['2010', 'National Green Tribunal Act', 'A special court for fast disposal of environmental cases'],
], { y: 1.45, colW: [1.2, 5.0, 5.93], fs: 16 });

// 18 Bhopal
s = h.slide('From Bhopal 1984 to the Environment Protection Act', 'This is our city\'s place in India\'s environmental history. Let students share what they know about the tragedy.');
h.flow(s, ['Bhopal Gas Tragedy, 2–3 December 1984', 'Environment (Protection) Act, 1986', 'Public Liability Insurance Act, 1991', 'National Green Tribunal, 2010'], { y: 1.55, h: 1.5, fs: 17 });
h.bullets(s, [
  ['The disaster:', 'methyl isocyanate (MIC) gas leaked from the Union Carbide pesticide plant in Bhopal, killing thousands and harming lakhs of people.'],
  ['The lesson:', 'India\'s laws were too scattered to deal with industrial hazards.'],
  ['The response:', 'the Environment (Protection) Act, 1986 gave the Central Government wide powers to set standards, regulate hazardous industries, and close polluting units.'],
  ['Bhopal today:', 'the Central Zone Bench of the National Green Tribunal sits in Bhopal.'],
], { y: 3.4, h: 3.0, fs: 17 });

// 19 Institutions
s = h.slide('Institutional framework in India', 'Follow the chain from top to bottom: policy at the Centre, enforcement in the states, action in cities and villages.');
h.table(s, [
  ['Level', 'Institution', 'Role'],
  ['Central', 'Ministry of Environment, Forest and Climate Change (MoEFCC)', 'Nodal ministry for environmental policy, planning and laws'],
  ['Central', 'Central Pollution Control Board (CPCB)', 'National monitoring, standards and technical advice'],
  ['Central', 'Forest Survey of India; National Biodiversity Authority', 'Forest-cover assessment; biodiversity regulation'],
  ['State', 'State Pollution Control Boards (in MP, the MPPCB)', 'Permissions to industries, inspection and enforcement'],
  ['Local', 'Municipal bodies, Gram Panchayats, Biodiversity Management Committees', 'Waste, sewage, lakes, green spaces, village resources'],
  ['Judicial', 'National Green Tribunal, Supreme Court, High Courts', 'Settle environmental disputes; enforce rights'],
], { y: 1.45, colW: [1.6, 5.4, 5.13], fs: 16 });

// 20 NEP
s = h.slide('National Environment Policy (NEP), 2006', 'NEP 2006 is a policy statement, not a law. It guides how all ministries consider environment in development.');
h.def(s, 'The National Environment Policy, 2006', 'is a comprehensive policy statement of the Government of India that guides environmental conservation and integrates environmental concerns into all development activities.', { h: 1.3, fs: 18 });
h.numbered(s, [
  ['Conserve', 'critical environmental resources such as forests, wetlands and biodiversity'],
  ['Equity', 'protect the livelihoods of the poor who depend on natural resources'],
  ['Efficiency', 'use natural resources efficiently and reduce waste'],
  ['Governance', 'apply good environmental governance: transparency, accountability, participation'],
  ['Integration', 'make environmental concerns part of economic and social development'],
], { y: 3.0, rowH: 0.68, fs: 17 });

// 21 NAPCC
s = h.slide('National Action Plan on Climate Change (NAPCC), 2008', 'Some sources list nine missions: the original eight plus a mission on human health added later.');
h.def(s, 'NAPCC', 'is India\'s national strategy to adapt to climate change and reduce emissions while continuing development. It works through eight national missions:', { h: 1.05, fs: 17 });
h.cards(s, [
  { b: '1', hd: 'Solar Mission' }, { b: '2', hd: 'Enhanced Energy Efficiency' }, { b: '3', hd: 'Sustainable Habitat' }, { b: '4', hd: 'Water Mission' },
  { b: '5', hd: 'Sustaining the Himalayan Ecosystem' }, { b: '6', hd: 'Green India Mission' }, { b: '7', hd: 'Sustainable Agriculture' }, { b: '8', hd: 'Strategic Knowledge for Climate Change' },
], { y: 2.7, h: 3.1, cols: 4, hfs: 17 });
h.note(s, 'eight original missions; a ninth on human health was added later, which is why some sources list nine.', { y: 6.05 });

// 22 NCAP
s = h.slide('National Clean Air Programme (NCAP), 2019', 'Bhopal is one of the NCAP non-attainment cities. Check the latest target and city list on the CPCB or PRANA portal before class.');
h.def(s, 'NCAP', 'is a national programme launched by MoEFCC in January 2019 to reduce particulate air pollution in Indian cities in a time-bound way.', { h: 1.05, fs: 17 });
h.def(s, 'A non-attainment city', 'is a city that has not met the National Ambient Air Quality Standards for five consecutive years. Over 130 cities are covered, including Bhopal.', { y: 2.65, h: 1.05, fs: 17 });
h.flow(s, ['MoEFCC and CPCB set the national plan', 'State boards supervise', 'City Clean Air Action Plan', 'Monitoring and annual review'], { y: 4.0, h: 1.15, fs: 16 });
h.bullets(s, [
  ['Target:', 'originally a 20–30% cut in particulate matter by 2024; later revised to up to 40% reduction in PM₁₀ by 2025–26, compared with 2017–18.'],
], { y: 5.45, h: 0.9, fs: 16 });

// 23 other programmes
s = h.slide('Other national programmes', 'Indore has repeatedly been ranked India\'s cleanest city in Swachh Survekshan.');
h.table(s, [
  ['Programme', 'Year', 'Main focus'],
  ['Project Tiger', '1973', 'Tiger conservation through tiger reserves; Madhya Pradesh is known as the “Tiger State”'],
  ['Swachh Bharat Mission', '2014', 'Sanitation, ending open defecation, solid-waste management; SBM-Urban 2.0 (2021) for garbage-free cities'],
  ['Green India Mission', '2014', 'Increase and restore forest and tree cover (a NAPCC mission)'],
  ['Namami Gange', '2014–15', 'Conservation and rejuvenation of the Ganga: sewage treatment, river-front work, afforestation'],
  ['AMRUT', '2015', 'Urban water supply, sewerage, drainage and green spaces; AMRUT 2.0 (2021)'],
], { y: 1.45, colW: [3.0, 1.4, 7.73], fs: 16 });

// 24
h.section('Part C: Local Level', 'Local bodies · communities · Bhopal case study');

// 25 local institutions
s = h.slide('Local environmental management', 'Point out that the 73rd and 74th Amendments put environment on the agenda of every village and city government.');
h.def(s, 'Local environmental management', 'means implementing environmental policies and solving environmental problems at the level of the city, town, village or district, through local bodies and the participation of local people.', { h: 1.3, fs: 17 });
h.table(s, [
  ['Institution', 'Legal basis', 'Environmental role'],
  ['Municipal bodies', '74th Amendment (1992), 12th Schedule', 'Solid waste, sewage, urban forestry, protection of the environment'],
  ['Gram Panchayats', '73rd Amendment (1992), 11th Schedule', 'Drinking water, social forestry, village ponds and commons'],
  ['Biodiversity Management Committees', 'Biological Diversity Act, 2002', 'Prepare People\'s Biodiversity Registers'],
  ['Joint Forest Management committees', 'Government resolution, 1990', 'Forest departments and villagers manage forests together'],
], { y: 2.95, colW: [3.4, 3.8, 4.93], fs: 16 });

// 26 community
s = h.slide('People\'s movements for the environment', 'Local action has often pushed national policy. Chipko is the classic example.');
h.cards(s, [
  { b: '1', hd: 'Chipko Movement (1973)', t: 'Villagers in the Garhwal Himalaya (now Uttarakhand), many of them women, hugged trees to stop commercial felling.' },
  { b: '2', hd: 'Appiko Movement (1983)', t: 'A Chipko-inspired movement to protect forests in the Western Ghats of Karnataka.' },
  { b: '3', hd: 'Narmada Bachao Andolan (late 1980s)', t: 'Protest against displacement and environmental loss from large dams on the Narmada, including in Madhya Pradesh.' },
], { y: 1.5, h: 3.6, cols: 3, fs: 17, hfs: 17 });
h.note(s, 'policy works best when local communities are partners, not just subjects of rules.', { y: 5.5 });

// 27 Bhopal case
s = h.slide('Case study: environmental management in Bhopal', 'Verify the current status of the Bhanpur site and Bhopal\'s NCAP figures before class; ask students to add examples from their own neighbourhoods.');
h.table(s, [
  ['Issue', 'Local management response'],
  ['Lake pollution', 'Protection of the Upper Lake (Bhojtal) and Lower Lake, together the Bhoj Wetland Ramsar site (2002); diverting sewage away from the lakes'],
  ['Air pollution', 'Bhopal is an NCAP city: City Clean Air Action Plan and continuous monitoring stations'],
  ['Solid waste', 'Door-to-door collection and segregation; the old Bhanpur dumpsite closed and remediated'],
  ['Sewage', 'Sewage treatment plants to stop wastewater entering water bodies'],
  ['Green cover', 'Plantation drives; protection of urban green spaces such as Van Vihar National Park'],
  ['Groundwater', 'Rainwater harvesting and recharge structures'],
], { y: 1.45, colW: [2.6, 9.53], fs: 16 });

// 28 three levels one issue
s = h.slide('One issue, three levels', 'Ask students to build a third row themselves, for example for waste (SDG 12 → Swachh Bharat → Bhopal Municipal Corporation).');
h.table(s, [
  ['Issue', 'Global', 'National (India)', 'Local (Bhopal)'],
  ['Air and climate', 'UNFCCC → Paris Agreement (2015)', 'NAPCC (2008) → NCAP (2019)', 'Bhopal City Clean Air Action Plan'],
  ['Water and wetlands', 'Ramsar Convention; SDG 6', 'Water Act (1974); AMRUT; water-quality monitoring', 'Upper Lake conservation; sewage treatment plants'],
  ['Biodiversity', 'CBD (1992)', 'Biological Diversity Act (2002)', 'Biodiversity Management Committees; Van Vihar'],
], { y: 1.5, colW: [2.4, 3.1, 3.4, 3.23], fs: 17 });
h.quote(s, 'Monitoring is the eyes, policy is the brain, and management is the hands of environmental protection.', { y: 4.85, h: 1.2, fs: 20 });

// 29 recap
s = h.slide('Recap', 'Close by linking back to Part 1: monitoring data feeds policy, and policy is carried out through management.');
h.cards(s, [
  { b: 'G', hd: 'Global', t: 'Ramsar 1971 · Stockholm 1972 (UNEP) · Brundtland and Montreal 1987 · Rio 1992 (Agenda 21, UNFCCC, CBD, CBDR) · Kyoto 1997 · Paris and SDGs 2015' },
  { b: 'N', hd: 'National', t: 'Articles 21, 48A, 51A(g) · Water 1974, Air 1981, EP 1986, BD 2002, NGT 2010 · MoEFCC, CPCB, SPCBs · NEP 2006, NAPCC 2008, NCAP 2019, Swachh Bharat, AMRUT, Namami Gange' },
  { b: 'L', hd: 'Local', t: '73rd and 74th Amendments · municipal bodies, panchayats, BMCs, JFM · Chipko · Bhopal: Bhoj Wetland, NCAP, waste management' },
], { y: 1.5, h: 3.9, cols: 3, fs: 19, hfs: 22 });

// 30 questions
s = h.slide('Check your understanding', 'Answers: (1) Stockholm 1972; (2) slide 8; (3) slide 12; (4) EP Act 1986; (5) slide 22; (6) 74th Amendment, 12th Schedule.');
h.numbered(s, [
  ['Which conference led to the creation of UNEP, and in which year?', ''],
  ['Give the Brundtland definition of sustainable development.', ''],
  ['State two differences between the Kyoto Protocol and the Paris Agreement.', ''],
  ['Which Act was passed after the Bhopal Gas Tragedy?', ''],
  ['What is a non-attainment city under NCAP?', ''],
  ['Which constitutional amendment gave municipal bodies environmental functions?', ''],
], { y: 1.5, rowH: 0.78, fs: 18 });

save(pres, out).then(() => console.log('wrote', out));
