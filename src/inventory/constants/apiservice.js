
const Apiservice = () => {
  const baseurl = `https://mydemov2.beautecloud.com/lb/api`;

  const headersAuthorization = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + "goods",
  };

  const createInstance = (method, data) => {
    return {
      method,
      headers: headersAuthorization,
      body: JSON.stringify(data),
    };
  };

  const getAPI = async (url) => {
    let apiurl = `${baseurl}/${url}`;
    const response = await fetch(apiurl, createInstance("GET"));
    return response.json();
  };

  const postAPI = async (url, requestBody) => {
    let apiurl = `${baseurl}/${url}`;

    const response = await fetch(apiurl, createInstance("POST", requestBody));
    return response.json();
  };

  const patchAPI = async (url, data) => {
    let apiurl = `${baseurl}/${url}`;

    const response = await fetch(apiurl, createInstance("PATCH", data));
    return response.json();
  };
  const putAPI = async (url, data) => {
    let apiurl = `${baseurl}/${url}`;

    const response = await fetch(apiurl, createInstance("PUT", data));
    return response.json();
  };

  return {
    getAPI,
    postAPI,
    patchAPI,
    putAPI,
  };
};

export default Apiservice;
