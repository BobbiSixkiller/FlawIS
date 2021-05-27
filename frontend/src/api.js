import Axios from "axios";

const api = Axios.create({
	baseURL: "https://flawis-backend.flaw.uniba.sk/api/",
});

export default api;
