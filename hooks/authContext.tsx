import {createContext, type PropsWithChildren, useContext} from 'react';
import {useStorageState} from '@/hooks/useStorageState';
import {fetchData} from '@/utilities/requests';

const AuthContext = createContext<{
    signIn: (username: string, password: string) => Promise<void>;
    guestSignIn: () => Promise<void>;
    signOut: () => void;
    register: (username: string, password: string) => Promise<void>;
    sessionToken?: string | null;
    id?: string | null;
    username?: string | null;
    isGuest?: string | null;
    isLoading: boolean;
}>({
    signIn: () => Promise.resolve(),
    guestSignIn: () => Promise.resolve(),
    signOut: () => null,
    register: () => Promise.resolve(),
    sessionToken: null,
    id: null,
    username: null,
    isGuest: null,
    isLoading: false,
});


export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }
    return value;
}

export function SessionProvider({children}: PropsWithChildren) {
    const [[isLoading, sessionToken], setSession] = useStorageState('session');
    const [[isIdLoading, id], setId] = useStorageState('id');
    const [[isUsernameLoading, username], setUsername] = useStorageState('username');
    const [[isIsGuestLoading, isGuest], setGuest] = useStorageState('isGuest');


    const register = async (username: string, password: string) => {
        const response = await fetchData(sessionToken, '/user/register', 'POST', {
            username: username,
            password: password,
        });

        if (!response.ok) {
            let json = await response.json();
            console.log(`${response.status}`, json);
            throw new Error(`${response.status}`);
        }

        let json = await response.json();
        setSession(json.jwt_token);
        setId(json.id);
        setUsername(json.username);
        setGuest(false.toString());
        console.log(json);
    };

    const signIn = async (username: string, password: string) => {
        const response = await fetchData(sessionToken, '/user/login', 'POST', {
            username: username.trim(),
            password: password,
        });

        if (!response.ok) {
            let json = await response.json();
            console.log(`${response.status}`, json);
            throw new Error(`${response.status}`);
        }

        let json = await response.json();
        setSession(json.jwt_token);
        setId(json.id);
        setUsername(json.username);
        setGuest(false.toString());
        console.log(json);
    };

    const guestSignIn = async () => {
        const response = await fetchData(sessionToken, '/user/guest', 'POST');

        if (!response.ok) {
            let json = await response.json();
            console.log(`${response.status}`, json);
            throw new Error(`${response.status}`);
        }

        let json = await response.json();
        setSession(json.jwt_token);
        setId(json.id);
        setUsername(json.username);
        setGuest(true.toString());
        console.log(json);
    };

    const signOut = () => {
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                guestSignIn,
                signOut,
                register,
                sessionToken: sessionToken,
                id: id,
                username: username,
                isGuest: isGuest,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
