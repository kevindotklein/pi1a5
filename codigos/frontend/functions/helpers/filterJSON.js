const filterJSON = (json) => {
    const formattedJSONString = json.replace(/^```json\n/, '').replace(/```\n$/, '');

    console.log(formattedJSONString)

    const jsonObject = JSON.parse(formattedJSONString);

    return jsonObject;
}

export { filterJSON };