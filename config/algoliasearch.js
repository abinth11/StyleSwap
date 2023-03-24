import algoliasearch from "algoliasearch";
const client = algoliasearch("9LLP9RS9DX", "3e47e70258702fe4a47b7ae1cde43adc");
export const index = client.initIndex("searchIndex");
export const searchWithAlgolia = async (query) => {
  const objectsToIndex = 
  index.addObjects(objectsToIndex, function (err, content) {
    if (err) throw err;
    console.log(content);
  });
  const results = await index.search({ query }); // perform the search on the Algolia index
};
