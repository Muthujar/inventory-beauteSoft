

export const queryParamsGenerate = (filter) => {
    let query = {
      where: {},
    };
  
    // Handle filter keys like where conditions
    Object.keys(filter).forEach((key) => {
      if (filter[key] !== "" && (filter[key] || filter[key] === 0)) {
        query.where[key] = filter[key];
      }
    });
  
    // Handle special keys separately
    if (filter.skip && filter.page&& filter.limit) {
      query.skip = filter.page*filter.limit;
    }
    if (filter.limit) {
      query.limit = filter.limit;
    }
    if (filter.order) {
      query.order = filter.order;
    }
    if (filter.fields) {
      query.fields = filter.fields;
    }
  
    // Check if 'where' is empty and there are no other filters (skip, limit, etc.)
    if (
      Object.keys(query.where).length === 0 &&
      !query.skip &&
      !query.limit &&
      !query.order &&
      !query.fields
    ) {
      return ""; // Return empty string if no filters are provided
    }
  
    let queryString = encodeURIComponent(JSON.stringify(query));
    return `?filter=${queryString}`;
  };


 export const  stockHdrs={
        docNo: "",
        docDate: "",
        docStatus: 0,
        supplyNo: "",
        docRef1: "",
        docRef2: "",
        docTerm: "",
        storeNo: "BeateSoft salon",
        docRemk1: "",
        postDate: "",
        createUser: "kk",

 }