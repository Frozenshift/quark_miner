import { sleep } from "./utils.js";

export async function httpRequest(
  url,
  maxRetries = 10,
  limit = true,
  delay = 0,
  method = "GET",
  data = null,
  authToken = null,
) {
  try {
    const headers = {};
    let body;

    if (data) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers,
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body,
    };

    async function getResponse(url, options, delay = 0, retries = 0) {
      await sleep(delay);
      let response;

      try {
        response = await fetch(url, options);
      } catch (error) {
        console.log(`Fetch failed: ${error.message}`);
        if (retries < maxRetries) {
          console.log(`Retrying... (${retries + 1}/${maxRetries})`);
          if (!limit) {
            retries = 0;
          }
          return getResponse(url, options, 1000, retries + 1);
        } else {
          console.log("Max retries reached. Request failed.");
          return null;
        }
      }

      if (response.status === 429) {
        console.log(`Too many requests, retrying after delay...`, url);
        if (!limit) {
          retries = 0;
        }
        return getResponse(url, options, 1000, retries + 1);
      }

      if (response.status >= 400 && response.status < 500) {
        return response.json();
      }

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");
        if (
          contentType &&
          contentType.toLowerCase().includes("application/json")
        ) {
          const jsonResponse = await response.json();
          return jsonResponse !== null
            ? jsonResponse
            : console.log("Received null response data.");
        } else {
          console.log(
            `Response headers error: ${response.headers.get("content-type")}`,
          );
        }
      } else {
        console.log(`Response Error: ${response.status}`);
      }

      if (retries < maxRetries) {
        console.log(`Retrying... (${retries + 1}/${maxRetries})`);
        if (!limit) {
          retries = 0;
        }
        return getResponse(url, options, 0, retries + 1);
      } else {
        console.log("Max retries reached. Request failed.");
        return null;
      }
    }

    const jsonResponse = await getResponse(url, options);

    return jsonResponse || console.log("Request ultimately failed.");
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`);
    return null;
  }
}
