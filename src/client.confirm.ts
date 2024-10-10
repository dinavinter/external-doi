import type {Communications} from "@gigya/types";
import {jsonApi, promisify} from "@/api";
import {useGigya} from "@gigya/wc";
const env = import.meta.env;

async function confirmApi(
    access_token: string,
    pendingEmailVerification: string[]
) {
    return await fetch(
        `https://accounts.${env.GIGYA_DOMAIN}/accounts.communication.confirm`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${access_token}`,
            },
            body: new URLSearchParams({
                apiKey: env.GIGYA_API_KEY,
                topics: pendingEmailVerification.join(","),
            }),
            mode: "cors",
        }
    );
}

 
export async function showConfirmation(
    access_token: string,
    pendingEmailVerification: string[]
) {
    const gigya = await useGigya((g) => g);
    const popup = document.createElement("div");
    const confirmResponse = await jsonApi(confirmApi.bind(null, access_token, pendingEmailVerification));

    const { UID, communications } = (await promisify(gigya.accounts.getAccountInfo, { includeCommunications: "all" })) as {
        UID: string;
        communications: Communications;
    };

    popup.innerHTML = `
    <dialog id="confirmDialog" class="absolute top-0 right-0 p-2 font-sans text-sm font-normal break-words whitespace-normal bg-white border rounded-lg shadow-lg w-max border-blue-gray-50 text-blue-gray-500 shadow-blue-gray-500/10 focus:outline-none max-h-[90vh] max-w-[75%]">
      <form  method="dialog" class="*:m-4 *:p-4">
       <button type="submit" class="flex items-center justify-center w-6 h-6 text-blue-gray-500 bg-white rounded-full shadow-lg cursor-pointer hover:bg-blue-gray-50" onclick="document.querySelector(#popover).hidePopover()">
        Close
      </button>
        <header>Confirm API</header>
         <pre class="overflow-y-scroll open:max-h-52 max-h-[20vh]" >${confirmApi}</pre>
         <label>Confirm Response</label>
         <pre >${JSON.stringify(confirmResponse)}</pre>
         <label>Account Info</label>
         <pre >${JSON.stringify({ UID, communications })}</pre>
         <pre > <a href="https://jwt.io?token=${access_token}"><img alt="view on jwt.io" src="https://jwt.io/img/badge.svg"/> </a>${access_token}</pre>
      </form>
       </dialog>
`;

    document.body.appendChild(popup);
    const dialog = document.getElementById("confirmDialog") as HTMLDialogElement;
    dialog.showModal();
    return new Promise((resolve) => {
        dialog.addEventListener("close", (e) => {
            console.log("close", e);
            resolve(e);
        });
        dialog.addEventListener("submit", (e) => {
            console.log("submit", e);
            resolve(e);
        });
    });
}
