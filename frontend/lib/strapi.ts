import qs from 'qs';

export const STRAPI_BASE_URL = process.env.STRAPI_API_URL || 'http://localhost:1337';

const QUERY_HOME_PAGE = {
  populate: {
    sections: {
      on: {
        'layout.hero-section': {
          populate: {
            image: {
              fields: ['url', 'alternativeText'],
            },
            link: {
              populate: true,
            },
          },
        },
      },
    },
  },
};

export async function getHomePage() {
  'use cache';

  const query = qs.stringify(QUERY_HOME_PAGE);
  const response = await getStrapiData(`/api/home-page?${query}`);
  return response?.data;
}

export async function getStrapiData(url: string) {
  try {
    const response = await fetch(`${STRAPI_BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Error fetching data from Strapi: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function registerUserService(userData: { username: string; email: string; password: string }) {
  try {
    const response = await fetch(`${STRAPI_BASE_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('🚀 ~ registerUserService ~ data:', data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
