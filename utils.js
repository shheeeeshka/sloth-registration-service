export const sleep = (sec = 0) => new Promise(resolve => setTimeout(resolve, sec * 1000));

export const getFinalActions = (actions = []) => {
    if (!actions.length) return [];
    const finalActions = [];
    const lastValues = {};
    let lastClickAction = null;

    const filteredClick = actions.filter((action) => action.type === "click");

    for (const action of actions) {
        if (action.type === "input") {
            lastValues[action.selector] = action.value;
            continue;
        }

        if (action.type === "change") {
            finalActions.push(action);
            continue;
        }
    }

    for (const selector in lastValues) {
        finalActions.push({
            type: "input",
            selector,
            value: lastValues[selector],
        });
    }

    if (lastClickAction) {
        finalActions.push(lastClickAction);
    }

    return [...finalActions, ...filteredClick];
};