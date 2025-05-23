import axios from 'axios';

export async function fetchRemoteData(url: string): Promise<string> {
  const response = await axios.get<string>(url);
  return response.data;
}
