
export interface SimulationStep {
    step: number;
    title: string;
    description: string;
    highlightParts?: string[]; // 3Dモデルでハイライトする部位のID
}

export const RECTUS_FEMORIS_SIMULATION: SimulationStep[] = [
    {
        step: 0,
        title: "正常な状態",
        description: "骨盤はニュートラルな位置にあり、脊柱（腰椎）も自然なS字カーブを描いています。大腿直筋（太ももの前の筋肉）は適切な長さを保っています。",
        highlightParts: []
    },
    {
        step: 1,
        title: "大腿直筋の硬化・短縮",
        description: "デスクワークや運動不足により、大腿直筋が硬くなり、縮み始めます。筋肉が赤く表示されている部分にご注目ください。",
        highlightParts: ["rectusFemoris"]
    },
    {
        step: 2,
        title: "骨盤の前傾",
        description: "短くなった大腿直筋に引っ張られる形で、骨盤が前側（下側）に傾きます。これが「骨盤前傾」の状態です。",
        highlightParts: ["pelvis", "rectusFemoris"]
    },
    {
        step: 3,
        title: "反り腰（代償姿勢）の発生",
        description: "前に倒れた骨盤に対し、体幹を起こそうとして腰椎が過剰に反らされます。この「反り腰」が腰への強い負担となり、痛みの原因となります。",
        highlightParts: ["lumbarSpine", "lowerBackHazard"]
    }
];
