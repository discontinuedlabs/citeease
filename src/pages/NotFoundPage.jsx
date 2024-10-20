import { useNavigate } from "react-router-dom";
import { EmptyPage } from "../components/ui/MaterialComponents";
import defaults from "../assets/json/defaults.json";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <EmptyPage
            className={defaults.classes.page}
            icon="error"
            title="404-Page Not Found"
            message="We're sorry, but the page you're trying to access could not be found. Please verify the URL or return to the homepage. If you need further assistance, feel free to contact us."
            actions={[
                ["Home", () => navigate("/")],
                [
                    "Contact support",
                    () => (window.location.href = "mailto:discontinuedlabs@gmail.com?subject=Support Request"), // eslint-disable-line no-return-assign
                ],
            ]}
        />
    );
}
