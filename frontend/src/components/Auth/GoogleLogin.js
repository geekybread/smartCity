import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


const GoogleAuth = ({ isAdminLogin = false }) => {
    const { login } = useAuth();

    const handleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/`,
                {
                    id_token: credentialResponse.credential,
                    provider: "google",
                    is_admin_login: isAdminLogin
                },
                { withCredentials: true }
            );
            localStorage.setItem('token', response.data.key);
            login(response.data.key, isAdminLogin);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <GoogleOAuthProvider 
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            redirectUri={window.location.origin}
        >
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log('Login Failed')}
                text={isAdminLogin ? "signin_with" : "continue_with"}
                theme={isAdminLogin ? "filled_blue" : "outline"}
                ux_mode="popup"  // Add this line
                cookie_policy="single_host_origin"
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleAuth;