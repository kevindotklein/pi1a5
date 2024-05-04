const filterJSON = (json) => {
  const formattedJSONString = json
    .replace(/^```json\n/, "")
    .replace(/```\n$/, "");

  console.log(formattedJSONString);

  try {
    const jsonObject = JSON.parse(formattedJSONString);

    return jsonObject;
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export { filterJSON };
