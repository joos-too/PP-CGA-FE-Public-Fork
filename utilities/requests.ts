import {api_url} from '@/constants/Network';

export async function fetchData(sessionToken: string | null | undefined, path: string,
                                method: 'GET' | 'DELETE' | 'PUT' | 'POST' = 'GET', data: any = null,
                                returnJson: boolean = false, content_type: string = 'application/json', accept: string = 'application/json') {
    try {
        const response = await fetch(api_url + path, {
            method: method,
            //@ts-ignore
            headers: {
                'Content-Type': content_type,
                'Authorization': sessionToken,
                'Accept': accept,
            },
            body: data ? JSON.stringify(data) : null,
        });

        if (response.ok) {
            if (returnJson) {
                return await response.json();
            } else {
                return response;
            }
        } else {
            console.error('Fetch fehlgeschlagen: ', response.status, await response.json());
            return null;
        }
    } catch (error) {
        console.error('Fehler in TypeScript fetch:', error);
        return null;
    }
}

export const fetchAvatar = async (userId: string | null | undefined, sessionToken: string | null | undefined): Promise<string | null> => {
    try {
        const avatarResponse = await fetch(`${api_url}/user/${userId}/profile_picture`, {
            method: 'GET',
            // @ts-ignore
            headers: {
                'Authorization': sessionToken,
                'Content-Type': 'application/json',
            },
        });

        if (avatarResponse.ok) {
            return `${api_url}/user/${userId}/profile_picture?timestamp=${new Date().getTime()};`;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen des Avatars:', error);
        return null;
    }
};


