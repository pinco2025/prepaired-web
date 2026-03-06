/**
 * Static data module for Organic Questions.
 * Merged from exported_questions.json + exported_solutions.json.
 * Each question has a URL-friendly slug for SEO-optimized individual pages.
 */

import { Question, Solution } from '../components/question/types';

export interface OrganicQuestionEntry {
    slug: string;
    question: Question;
    solution: Solution;
    // Extra metadata for SEO / display
    tag1: string;
    tag2: string;
    year: string;
    examSource: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
}

/**
 * Generate a slug from question text + uuid.
 * Takes first ~6 meaningful words + short uuid suffix.
 */
function generateSlug(text: string, uuid: string): string {
    const cleaned = text
        .replace(/\$\$[\s\S]+?\$\$/g, '') // remove block math
        .replace(/\$[\s\S]+?\$/g, '')     // remove inline math
        .replace(/\\text\{([^}]*)\}/g, '$1') // extract \text{} content
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\textit\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')      // remove LaTeX commands
        .replace(/[{}\\^_]/g, '')          // remove special chars
        .replace(/[^a-zA-Z0-9\s-]/g, '')  // keep only alphanumeric
        .trim();

    const words = cleaned
        .split(/\s+/)
        .filter(w => w.length > 1)
        .slice(0, 6)
        .map(w => w.toLowerCase());

    const shortUuid = uuid.replace(/-/g, '').slice(0, 8);
    return [...words, shortUuid].join('-');
}

/**
 * Generate SEO description from question text.
 */
function generateSeoDescription(text: string, year: string, examSource: string): string {
    const cleaned = text
        .replace(/\$\$[\s\S]+?\$\$/g, '[equation]')
        .replace(/\$[\s\S]+?\$/g, '[formula]')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}\\^_]/g, '')
        .trim()
        .slice(0, 120);

    const yearPart = year ? ` (${year})` : '';
    const examPart = examSource ? ` ${examSource}` : '';
    return `${cleaned}... |${examPart}${yearPart} Question with detailed solution on prepAIred.`;
}

/**
 * Generate SEO title from question text.
 */
function generateSeoTitle(text: string, index: number, examSource: string): string {
    const cleaned = text
        .replace(/\$\$[\s\S]+?\$\$/g, '')
        .replace(/\$[\s\S]+?\$/g, '')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}\\^_]/g, '')
        .trim()
        .slice(0, 60);

    return `${cleaned} | ${examSource} Chemistry | prepAIred`;
}

// ────────────────────────────────────────────────────────
// Raw question data (from exported_questions.json)
// ────────────────────────────────────────────────────────
const rawQuestions = [
    {
        uuid: "2a0f9ea5-c0f0-4261-80ea-50851792cd5a",
        question: "A reaction sequence starting from chlorobenzene is carried out as described below:\n\n$$\\text{Chlorobenzene} \\xrightarrow[\\text{(ii) } \\text{H}^+]{\\text{(i) } \\text{NaOH, 623 K, 300 atm}} [\\textbf{X}] \\xrightarrow[\\text{H}_2\\text{SO}_4]{\\text{Na}_2\\text{Cr}_2\\text{O}_7} [\\textbf{Y}]$$\n\nIdentify the major organic products $\\textbf{X}$ and $\\textbf{Y}$ formed in this sequence.",
        question_image_url: null,
        option_a: "$\\text{X = Phenol, Y = Benzene}$",
        option_a_image_url: null,
        option_b: "$\\text{X = Phenol, Y = } \\textit{p}\\text{-Benzoquinone}$",
        option_b_image_url: null,
        option_c: "$\\text{X = Benzaldehyde, Y = Benzoic acid}$",
        option_c_image_url: null,
        option_d: "$\\text{X = Benzene, Y = Phenol}$",
        option_d_image_url: null,
        answer: "B",
        type: "IPQ",
        year: "",
        tag_1: "",
        tag_2: "HAH",
        examSource: "IPQ"
    },
    {
        uuid: "4e4182be-4b53-4b48-b4cb-841a7662ab71",
        question: "A tetrabrominated alkane undergoes the following sequential transformations:\n\nStep 1: Treatment with reagent A produces compound B\nStep 2: Treatment of B with reagent C produces an alkyne\n\nIdentify the correct set of reagents A and C for this transformation sequence.\n\nChoose the correct answer from the options given below:",
        question_image_url: "https://lh3.googleusercontent.com/d/1lCgvQ32dAIhXH0qUs42CTf0HDYZwg7q9=w1180",
        option_a: "A = Zn/CH₃OH, C = KOH/ethanol",
        option_a_image_url: null,
        option_b: "A = dilute NaOH, C = Br₂/CHCl₃",
        option_b_image_url: null,
        option_c: "A = concentrated alcoholic NaOH, C = HBr/acetic acid",
        option_c_image_url: null,
        option_d: "A = NaI/acetone, C = NaNH₂ followed by CH₃I",
        option_d_image_url: null,
        answer: "D",
        type: "IPQ",
        year: "2024",
        tag_1: "JEE Main 2024 (Online) 4th April Morning Shift",
        tag_2: "HAH",
        examSource: "IPQ"
    },
    {
        uuid: "638830d0-1d76-405d-8854-be2171aa38d6",
        question: "Find the product C",
        question_image_url: "https://lh3.googleusercontent.com/d/1uHPfR3MeQOujzD4A43DziJEkngHL_lDL=w1170",
        option_a: "",
        option_a_image_url: "https://lh3.googleusercontent.com/d/16ELFoqF1SwWDGViDb5gxduzzjbwoptVk=w1175",
        option_b: "",
        option_b_image_url: "https://lh3.googleusercontent.com/d/1mI1HykuFBD6BXZouUWarZza14SEHxHZ5=w1150",
        option_c: "",
        option_c_image_url: "https://lh3.googleusercontent.com/d/1Av9_VhwPqvgHRT2pXNOYZxiF-8yF-B0z=w1193",
        option_d: "",
        option_d_image_url: "https://lh3.googleusercontent.com/d/1fyeLiz5JhBBbDRuJNOod0WlUJubNa8t8=w1160",
        answer: "D",
        type: "IPQ",
        year: "2025",
        tag_1: "JEE Main 2025 (Online) 4th April Evening Shift",
        tag_2: "HAH",
        examSource: "IPQ"
    },
    {
        uuid: "b2c9de997fea",
        question: "Identify 'X' in the following reaction.",
        question_image_url: "https://lh3.googleusercontent.com/d/1lrBcJPyU8pvVlC0AdJrlRPFR3K_9v4Dg=w1181",
        option_a: "",
        option_a_image_url: "https://lh3.googleusercontent.com/d/1Dxc5v5V2YyP73-5r-vJhS_t27njplyQU=w1161",
        option_b: "",
        option_b_image_url: "https://lh3.googleusercontent.com/d/10ZonU-QMaWIJnzWo9Si5_YCMTI7eR14i=w1148",
        option_c: "",
        option_c_image_url: "https://lh3.googleusercontent.com/d/18ZqeLw6eeBhpo7ZcXdwSV3sjzVJNVSqe=w1163",
        option_d: "",
        option_d_image_url: "https://lh3.googleusercontent.com/d/1eX_nHkqttglnwE5mSNkLZmC72ykMvn5O=w1134",
        answer: "A",
        type: "PYQ",
        year: "2023",
        tag_1: "NEET 2023 Manipur",
        tag_2: "HAH",
        examSource: "NEET"
    },
    {
        uuid: "e1e435ced01e",
        question: "The compound $C_{7}H_{8}$ undergoes the following sequence of reactions:\n\n$C_{7}H_{8} \\xrightarrow[\\Delta]{3Cl_{2}} A \\xrightarrow{Br_{2}/Fe} B \\xrightarrow{Zn/HCl} C$\n\nThe product 'C' is:",
        question_image_url: "",
        option_a: "m-bromotoluene",
        option_a_image_url: "",
        option_b: "o-bromotoluene",
        option_b_image_url: "",
        option_c: "3-bromo-2,4,6-trichlorotoluene",
        option_c_image_url: "",
        option_d: "p-bromotoluene",
        option_d_image_url: "",
        answer: "A",
        type: "PYQ",
        year: "2018",
        tag_1: "NEET 2018",
        tag_2: "HAH",
        examSource: "NEET"
    },
    {
        uuid: "15dffa6991d9",
        question: "Predict the type of reaction and identify the product $A$ for the following reaction:\n\n\n\nChoose the most appropriate description:",
        question_image_url: "https://lh3.googleusercontent.com/d/1l2WZIwSVtlrHpE44fM0sVSobV59lg9rv=w1142",
        option_a: "Elimination Addition Reaction",
        option_a_image_url: "https://lh3.googleusercontent.com/d/1lOlktt2Kw60QT1OCnjbBJFo4mdvU5YO9=w1136",
        option_b: "Cine Substitution",
        option_b_image_url: "https://lh3.googleusercontent.com/d/1Dc8H94ovyufKxNv6-Mjg0H3qqzBQcNVF=w792",
        option_c: "Electrophilic Aromatic Substitution",
        option_c_image_url: "https://lh3.googleusercontent.com/d/1perCD7ZadWDbW7828bgAEQ5-ed22snCG=w1165",
        option_d: "Elimination Addition Reaction",
        option_d_image_url: "https://lh3.googleusercontent.com/d/1jrLfZDmnacHoXohDihkAetVgbOFfbuA3=w1193",
        answer: "D",
        type: "PYQ",
        year: "2017",
        tag_1: "NEET 2017",
        tag_2: "HAH",
        examSource: "NEET"
    },
    {
        uuid: "3dc0ad5252f9",
        question: "Consider the following reactions:\n\n(i) $(CH_{3})_{2}CH-CH_{2}Br \\xrightarrow{C_{2}H_{5}OH} (CH_{3})_{2}CH-CH_{2}OC_{2}H_{5} + HBr$\n(ii) $(CH_{3})_{2}CH-CH_{2}Br \\xrightarrow{C_{2}H_{5}O^{-}} (CH_{3})_{2}CH-CH_{2}OC_{2}H_{5} + Br^{-}$\n\nThe mechanisms of reactions (i) and (ii) are respectively:",
        question_image_url: "",
        option_a: "$S_{N}1$ and $S_{N}2$",
        option_a_image_url: "",
        option_b: "$S_{N}1$ and $S_{N}1$",
        option_b_image_url: "",
        option_c: "$S_{N}2$ and $S_{N}2$",
        option_c_image_url: "",
        option_d: "$S_{N}2$ and $S_{N}1$",
        option_d_image_url: "",
        answer: "C",
        type: "PYQ",
        year: "",
        tag_1: "",
        tag_2: "HAH",
        examSource: "NEET"
    },
    {
        uuid: "e9330889a2fc",
        question: "In an $S_N2$ substitution reaction of the type:\n\n$$R-Br + Cl^{-} \\xrightarrow{DMF} R-Cl + Br^{-}$$\n\nWhich one of the following alkyl bromides exhibits the highest relative rate?",
        question_image_url: "",
        option_a: "",
        option_a_image_url: "https://lh3.googleusercontent.com/d/1TKcPz4SyChGJdyFO_uWFeZFL6YvrOQgb=w1172",
        option_b: "${CH_3CH_2Br}$",
        option_b_image_url: "",
        option_c: "${CH_3CH_2CH_2Br}$",
        option_c_image_url: "",
        option_d: "",
        option_d_image_url: "https://lh3.googleusercontent.com/d/10mTja3vxMQxJ3VkhAQTIcIh_mRULiNrT=w1106",
        answer: "B",
        type: "PYQ",
        year: "",
        tag_1: "",
        tag_2: "HAH",
        examSource: "NEET"
    },
    {
        uuid: "11ecc93dacfc",
        question: "Identify the major product in the following reaction.",
        question_image_url: "https://lh3.googleusercontent.com/d/1wLWY487BnHbqIDmVv2WExcq3cZ2woTlV=w1012",
        option_a: "",
        option_a_image_url: "https://lh3.googleusercontent.com/d/1khFOB8m7yHvH7kASSWFmgDZcv3qDK4fz=w1083",
        option_b: "",
        option_b_image_url: "https://lh3.googleusercontent.com/d/14CtLfcnBiQsYwIG9gCMcJzD58WFVmi4Q=w944",
        option_c: "",
        option_c_image_url: "https://lh3.googleusercontent.com/d/1wrNW9IzsLbLWrkoo7dPvWg5Yaw6t4cUJ=w977",
        option_d: "",
        option_d_image_url: "https://lh3.googleusercontent.com/d/1S3_bEFbbqx2TitaVI4INWPx6Lrdpz2NI=w1028",
        answer: "B",
        type: "PYQ",
        year: "2024",
        tag_1: "JEE Main 2024 (Online) 5th April Evening Shift",
        tag_2: "HAH",
        examSource: "JEE"
    },
    {
        uuid: "1166fd0b-eb52-49ed-b7b3-34c22fde51b1",
        question: "Consider the following chemical transformation sequence starting from ethoxybenzene:\n\n$$\\text{Ethoxybenzene} \\xrightarrow{\\text{HNO}_3, \\text{ H}_2\\text{SO}_4} [\\textbf{P}] \\xrightarrow{\\text{2Br}_2, \\text{ Fe}} [\\textbf{Q}]$$\n\n$\\rightarrow$ The first stage involves the nitration of ethoxybenzene to produce the major isomer, product $\\textbf{P}$.\n$\\rightarrow$ In the second stage, product $\\textbf{P}$ reacts with two equivalents of bromine in the presence of an iron catalyst to yield the final major product $\\textbf{Q}$.\n\nIf $\\alpha$ is the ratio of the total number of oxygen atoms to the total number of bromine atoms in one molecule of product $\\textbf{Q}$, then the value of $20\\alpha$ is:",
        question_image_url: null,
        option_a: "",
        option_a_image_url: null,
        option_b: "",
        option_b_image_url: null,
        option_c: "",
        option_c_image_url: null,
        option_d: "",
        option_d_image_url: null,
        answer: "30",
        type: "IPQ",
        year: "",
        tag_1: "",
        tag_2: "HAH",
        examSource: "IPQ"
    }
];

// ────────────────────────────────────────────────────────
// Raw solution data (from exported_solutions.json)
// ────────────────────────────────────────────────────────
const rawSolutions: Record<string, { solution_text: string; solution_image_url: string }> = {
    "2a0f9ea5-c0f0-4261-80ea-50851792cd5a": {
        solution_text: "$\\pmb{\\text{Step 1: Conversion of Chlorobenzene to Product X}}$\n\nChlorobenzene is treated with aqueous sodium hydroxide at a high temperature (623 K) and high pressure (300 atm), followed by acidification. This industrial process is known as the **Dow Process**. The nucleophilic substitution of the chlorine atom by a hydroxyl group occurs under these drastic conditions to yield phenol.\n\n$$\\text{C}_6\\text{H}_5\\text{Cl} \\xrightarrow[\\text{623 K, 300 atm}]{\\text{NaOH}} \\text{C}_6\\text{H}_5\\text{ONa} \\xrightarrow{\\text{H}^+} \\text{C}_6\\text{H}_5\\text{OH (Phenol)}$$\n\n$\\rightarrow$ $\\textbf{Product X}$ is $\\textbf{ Phenol}$\n\n$\\pmb{\\text{Step 2: Oxidation of Product X to Product Y}}$\n\nPhenol ([\\textbf{X}]) is then subjected to oxidation using sodium dichromate ($\\text{Na}_2\\text{Cr}_2\\text{O}_7$) in the presence of sulfuric acid ($\\text{H}_2\\text{SO}_4$). This reaction involves the oxidation of the aromatic ring to produce a conjugated diketone.\n\n$$\\text{C}_6\\text{H}_5\\text{OH} \\xrightarrow{\\text{Na}_2\\text{Cr}_2\\text{O}_7 / \\text{H}_2\\text{SO}_4} \\text{O=C}_6\\text{H}_4\\text{=O (}\\textit{p}\\text{-Benzoquinone)}$$\n\n$\\rightarrow$ $\\textbf{Product Y}$ is $\\textit{p}$-Benzoquinone.\n\n$\\pmb{\\text{Conclusion:}}$\n\nThe products are phenol and $\\textit{p}$-benzoquinone, respectively.\n\nTherefore, the correct answer is $\\boxed{\\text{X = Phenol, Y = } \\textit{p}\\text{-Benzoquinone}}.$",
        solution_image_url: ""
    },
    "4e4182be-4b53-4b48-b4cb-841a7662ab71": {
        solution_text: "$\\textbf{Understanding the Transformation:}$\n\nTetrabrominated alkane → Intermediate B → Alkyne\n\n$\\textbf{Step 1 - Reagent A:}$\n\n• NaI/acetone performs dehalogenation\n• I⁻ replaces Br atoms via nucleophilic substitution\n• Forms intermediate (dibromide or alkene)\n\n$\\textbf{Step 2 - Reagent C:}$\n\n• NaNH₂ (strong base) eliminates HBr → alkyne\n• CH₃I alkylates terminal alkyne via acetylide ion\n\n$\\textbf{Evaluation of Options:}$\n\n$\\textbf{Option A:}$ Zn/CH₃OH then KOH/ethanol - Not ideal for this transformation ✗\n\n$\\textbf{Option B:}$ Dilute NaOH then Br₂/CHCl₃ - Adds bromine, doesn't form alkyne ✗\n\n$\\textbf{Option C:}$ Conc. NaOH then HBr/acetic acid - HBr adds to alkyne (wrong direction) ✗\n\n$\\textbf{Option D:}$ NaI/acetone then NaNH₂/CH₃I - Correct sequence ✓\n\n$\\textbf{Conclusion:}$\nA = NaI/acetone (dehalogenation), C = NaNH₂/CH₃I (elimination + alkylation)\n\nTherefore, the correct answer is $\\textbf{Option D}$.",
        solution_image_url: "https://lh3.googleusercontent.com/d/12ii9_O3THHFmQg4JStKf27Tw00OLv7aG=w847"
    },
    "638830d0-1d76-405d-8854-be2171aa38d6": {
        solution_text: "1. Electrophillic Addition occurs at most stable carbocation.\n2.Hydrogenation reduces the remaining 2 pie bonds\n3.Alcoholic KOH further removes Br by E2 elimination to form most stable Alkene ",
        solution_image_url: "https://lh3.googleusercontent.com/d/1-Im6boOoT31h9G58RC3fqTbpQS2qFo8X=w1196"
    },
    "b2c9de997fea": {
        solution_text: "",
        solution_image_url: "https://lh3.googleusercontent.com/d/1GbJ2dfrgakWT0gwthn2LYDDRC3aY4KuC=w1152"
    },
    "e1e435ced01e": {
        solution_text: "$\\pmb{\\text{Step-by-step reaction analysis:}}$\n\n$\\pmb{\\text{1. Conversion of } C_{7}H_{8} \\text{ to A:}}$\nThe starting material $C_{7}H_{8}$ is $\\textbf{Toluene}$ ($C_{6}H_{5}CH_{3}$). Reaction with $3$ moles of $Cl_{2}$ under heating ($\\Delta$) favors free-radical side-chain chlorination over electrophilic aromatic substitution.\n$$C_{6}H_{5}CH_{3} \\xrightarrow[\\Delta]{3Cl_{2}} C_{6}H_{5}CCl_{3} + 3HCl$$\nProduct $\\pmb{\\text{A}}$ is $\\textbf{Benzotrichloride}$.\n\n$\\pmb{\\text{2. Conversion of A to B:}}$\nIn the presence of $Fe$ (which forms $FeBr_{3}$ in situ), electrophilic aromatic substitution occurs. The $-CCl_{3}$ group is a strongly deactivating group and is $\\textbf{meta-directing}$ because it withdraws electron density from the ring via the $-I$ effect and reverse hyperconjugation.\n$$C_{6}H_{5}CCl_{3} \\xrightarrow{Br_{2}/Fe} m\\text{-Br-}C_{6}H_{4}CCl_{3}$$\nProduct $\\pmb{\\text{B}}$ is $\\textbf{m-bromobenzotrichloride}$.\n\n$\\pmb{\\text{3. Conversion of B to C:}}$\nTreatment with $Zn/HCl$ (a reducing agent) reduces the trichloromethyl group ($-CCl_{3}$) back to a methyl group ($-CH_{3}$).\n$$m\\text{-Br-}C_{6}H_{4}CCl_{3} \\xrightarrow{Zn/HCl} m\\text{-Br-}C_{6}H_{4}CH_{3}$$\nProduct $\\pmb{\\text{C}}$ is $\\textbf{m-bromotoluene}$.\n\n\n\n$\\pmb{\\text{Conclusion:}}$\nThe sequence results in the formation of $\\textbf{m-bromotoluene}$.\n\nTherefore, the correct option is $\\boxed{\\text{A}}$.",
        solution_image_url: "https://lh3.googleusercontent.com/d/1HmvnmLpeiOZ03JN0wSuPFjAIZITIXuU_=w1128"
    },
    "15dffa6991d9": {
        solution_text: "$\\pmb{\\text{Reaction Pathway:}}$\nThe reaction of $m$-bromoanisole with $\\text{NaNH}_2$ in liquid $\\text{NH}_3$ proceeds via a $\\pmb{\\text{benzyne (elimination-addition)}}$ mechanism.\n\n$\\pmb{\\text{Mechanism:}}$\n1. $\\pmb{\\text{Elimination:}}$ Strong base $\\text{NH}_2^-$ removes an ortho-proton followed by $\\text{Br}^-$ loss to form a benzyne intermediate.\n2. $\\pmb{\\text{Addition:}}$ Nucleophilic attack of $\\text{NH}_2^-$ on the benzyne triple bond.\n\n$\\pmb{\\text{Regioselectivity:}}$\nThe $-\\text{OCH}_3$ group exerts a $\\pmb{\\text{-I effect}}$, stabilizing the carbanion intermediate when the nucleophile attacks the $\\pmb{\\text{meta}}$ position. \n\n$\\pmb{\\text{Conclusion:}}$\nThe major product is $\\pmb{\\text{m-anisidine}}$. Since the process involve loss of $\\text{HBr}$ followed by addition of $\\text{NH}_3$, it is an $\\pmb{\\text{Elimination-Addition reaction}}$.",
        solution_image_url: ""
    },
    "3dc0ad5252f9": {
        solution_text: "$\\pmb{\\text{Mechanistic Analysis:}}$\n\n$\\begin{array}{|l|l|l|} \\hline \\textbf{Reaction} & \\textbf{Reagent Type} & \\textbf{Mechanism} \\\\ \\hline (i) & \\text{Weak Nucleophile (Ethanol)} & S_{N}2 \\\\ \\hline (ii) & \\text{Strong Nucleophile (Ethoxide)} & S_{N}2 \\\\ \\hline \\end{array}$\n\n$\\pmb{\\text{Detailed Explanation:}}$\n\n  - In both reactions, the substrate is $\\textbf{isobutyl bromide}$, which is a primary alkyl halide.\n  - Primary alkyl halides are highly hindered toward $S_{N}1$ mechanisms because the resulting primary carbocation is very unstable.\n  - If an $S_{N}1$ mechanism were to occur, the primary carbocation $(CH_{3})_{2}CH-CH_{2}^{+}$ would undergo a $\\textbf{1,2-hydride shift}$ to form a more stable tertiary carbocation, leading to a rearranged product.\n  - \n  - Since the products shown in both (i) and (ii) are $\\textbf{unrearranged}$ (simple substitution of the bromide with the ethoxy group), we can conclude that no carbocation intermediate was formed.\n  - This indicates that both reactions proceed via a concerted $\\textbf{S}_{\\textbf{N}}\\textbf{2}$ pathway where the nucleophile attacks while the leaving group departs.\n\n$\\pmb{\\text{Conclusion:}}$\nBoth reactions follow the $S_{N}2$ mechanism as there is no rearrangement observed.\n\nTherefore, the correct option is $\\boxed{\\text{C}}$.",
        solution_image_url: ""
    },
    "e9330889a2fc": {
        solution_text: "$\\pmb{\\text{Theoretical Analysis:}}$\n\nThe $S_N2$ (Substitution Nucleophilic Bimolecular) mechanism proceeds via a backside attack of the nucleophile on the carbon atom bonded to the leaving group. The reaction rate is primarily governed by $\\textbf{steric hindrance}$ at the reaction center.\n\n$\\pmb{\\text{Comparison of Substrates:}}$\n\n- $\\textbf{Option B (Ethyl Bromide):}$ $\\text{CH}_3\\text{CH}_2\\text{Br}$ is a primary ($1^\\circ$) alkyl halide with minimal steric bulk, allowing for the fastest nucleophilic approach.\n\n- $\\textbf{Option C (n-Propyl Bromide):}$ $\\text{CH}_3\\text{CH}_2\\text{CH}_2\\text{Br}$ is also $1^\\circ$, but the slightly longer chain increases the steric footprint compared to the ethyl group.\n\n- $\\textbf{Option A (Isobutyl Bromide):}$ $\\text{(CH}_3\\text{)}_2\\text{CHCH}_2\\text{Br}$ is a $1^\\circ$ halide with a branch at the $\\beta$-carbon, which significantly slows down the reaction.\n\n- $\\textbf{Option D (Neopentyl Bromide):}$ $\\text{(CH}_3\\text{)}_3\\text{CCH}_2\\text{Br}$ is extremely hindered due to three methyl groups on the $\\beta$-carbon, making $S_N2$ nearly impossible.\n\n$\\pmb{\\text{Reactivity Order (Array Representation):}}$\n\n$$\\begin{array}{|l|l|} \\hline \\textbf{Alkyl Group} & \\textbf{Relative Rate Preference} \\\\ \\hline \\text{Methyl} & \\text{Highest} \\\\ \\hline \\text{Ethyl (B)} & \\text{High} \\\\ \\hline \\text{n-Propyl (C)} & \\text{Moderate} \\\\ \\hline \\text{Isobutyl (A)} & \\text{Low} \\\\ \\hline \\text{Neopentyl (D)} & \\text{Lowest} \\\\ \\hline \\end{array}$$\n\nTherefore, $\\textbf{Ethyl bromide}$ has the highest relative rate among the given choices.\n\nCorrect Answer: $\\boxed{B}$",
        solution_image_url: ""
    },
    "11ecc93dacfc": {
        solution_text: "",
        solution_image_url: ""
    },
    "1166fd0b-eb52-49ed-b7b3-34c22fde51b1": {
        solution_text: "$\\pmb{\\text{Step 1: Conversion of Ethoxybenzene to Product P}}$\n\nIn the nitration of ethoxybenzene, the ethoxy group ($-\\text{OC}_2\\text{H}_5$) acts as an activating and $\\textit{ortho/para}$ directing group due to the $+M$ effect of the oxygen lone pair. Because the ethoxy group is sterically bulky, the electrophilic substitution by the nitronium ion ($\\text{NO}_2^+$) occurs primarily at the $\\textit{para}$ position to minimize steric strain.\n$$\\rightarrow \\textbf{Product P: } \\text{1-ethoxy-4-nitrobenzene}$$\n\n$\\pmb{\\text{Step 2: Conversion of Product P to Product Q}}$\n\nProduct $\\textbf{P}$ is then subjected to electrophilic aromatic bromination with two equivalents of $\\text{Br}_2$. We must determine the directing effects of the two substituents present:\n$\\bullet$ The ethoxy group at $\\text{C}_1$ is $\\textit{ortho}$ directing (positions 2 and 6).\n$\\bullet$ The nitro group at $\\text{C}_4$ is a $\\textit{meta}$ director (positions 2 and 6).\n\nBoth groups reinforce each other, directing the bromine atoms to positions 2 and 6. Since two equivalents of bromine are used, both available positions are substituted.\n$$\\rightarrow \\textbf{Product Q: } \\text{2,6-dibromo-1-ethoxy-4-nitrobenzene}$$\n\n$\\pmb{\\text{Step 3: Determination of the Ratio } \\alpha}$\n\n$\\bullet$ **Oxygen Atoms in Q:** There is 1 oxygen atom in the ethoxy group and 2 oxygen atoms in the nitro group. Total O atoms = 3.\n$\\bullet$ **Bromine Atoms in Q:** There are 2 bromine atoms substituted on the benzene ring. Total Br atoms = 2.\n\nThe ratio $\\alpha$ is defined as:\n$$\\alpha = \\frac{\\text{Number of O atoms}}{\\text{Number of Br atoms}} = \\frac{3}{2} = 1.5$$\n\n$\\pmb{\\text{Final Calculation:}}$\n\nThe required value is $20\\alpha$:\n$$20 \\times 1.5 = 30$$\n\nTherefore, the correct answer is $\\boxed{30}.$",
        solution_image_url: "https://lh3.googleusercontent.com/d/1ntwPttz_yve_nHWlD6XJHnQaKUOJEJJh=w694"
    }
};

// ────────────────────────────────────────────────────────
// Build final organic questions array
// ────────────────────────────────────────────────────────
export const organicQuestions: OrganicQuestionEntry[] = rawQuestions.map((raw, index) => {
    const sol = rawSolutions[raw.uuid] || { solution_text: '', solution_image_url: '' };
    const slug = generateSlug(raw.question, raw.uuid);

    // Build options array
    const options = [
        { id: 'a', text: raw.option_a, image: raw.option_a_image_url || undefined },
        { id: 'b', text: raw.option_b, image: raw.option_b_image_url || undefined },
        { id: 'c', text: raw.option_c, image: raw.option_c_image_url || undefined },
        { id: 'd', text: raw.option_d, image: raw.option_d_image_url || undefined },
    ];

    const question: Question = {
        id: raw.uuid,
        uuid: raw.uuid,
        text: raw.question,
        image: raw.question_image_url || undefined,
        options,
        correctAnswer: raw.answer,
        year: raw.year || undefined,
        type: 'MCQ',
    };

    const solution: Solution = {
        id: raw.uuid,
        text: sol.solution_text,
        image: sol.solution_image_url || undefined,
    };

    return {
        slug,
        question,
        solution,
        tag1: raw.tag_1 || '',
        tag2: raw.tag_2 || '',
        year: raw.year || '',
        examSource: raw.examSource || '',
        seoTitle: generateSeoTitle(raw.question, index, raw.examSource || 'Chemistry'),
        seoDescription: generateSeoDescription(raw.question, raw.year || '', raw.examSource || ''),
        seoKeywords: [
            'JEE chemistry', 'NEET chemistry', 'organic chemistry',
            'haloalkanes', 'haloarenes', 'reaction mechanism',
            raw.examSource || '', raw.year ? `${raw.year} question` : '',
            'prepAIred', 'solved question', 'detailed solution'
        ].filter(Boolean),
    };
});

/**
 * Get a question entry by its slug.
 */
export function getQuestionBySlug(slug: string): OrganicQuestionEntry | undefined {
    return organicQuestions.find(q => q.slug === slug);
}

/**
 * Get all organic questions.
 */
export function getAllOrganicQuestions(): OrganicQuestionEntry[] {
    return organicQuestions;
}
