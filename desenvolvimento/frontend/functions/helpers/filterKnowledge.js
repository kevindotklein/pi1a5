const filterKnowledge = (knowledge) => {
    // if text has \n, remove all \n
    const knowledgeWithoutLineBreaks = knowledge.replace(/\n/g, "");

    // if text has \r, remove all \r
    const knowledgeWithoutCarriageReturns = knowledgeWithoutLineBreaks.replace(/\r/g, "");

    // if text has \t, remove all \t
    const knowledgeWithoutTabs = knowledgeWithoutCarriageReturns.replace(/\t/g, "");

    return knowledgeWithoutTabs;
}

export { filterKnowledge };