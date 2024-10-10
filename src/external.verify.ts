import type {Communications} from "@gigya/types";
import {type IAfterSubmitEvent, useGigya} from "@gigya/wc";
import {jsonApi,promisify} from "@/api";
import {showConfirmation} from "@/client.confirm";
const env = import.meta.env;

async function tokenApi(uid: string) {
    return fetch(`https://accounts.${env.GIGYA_DOMAIN}/accounts.token`, {
        body: new URLSearchParams({
            uid: uid,
            method: "otp",
            channel: "email",
            resource: "urn:gigya:confirm_communication",
            apiKey: env.GIGYA_API_KEY,
            userKey: env.GIGYA_APP_KEY,
            secret: env.GIGYA_APP_SECRET,
            response_type: "token",
            httpStatusCodes: "true",
        }),
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        mode: "cors",
    });
}

export async function externalDoi(event:IAfterSubmitEvent) {
    if(event.response.errorCode === 0){
    const gigya = await useGigya(g=>g);
    const { UID, communications } = (await promisify(
        gigya.accounts.getAccountInfo,
        { includeCommunications: "all" }
    )) as {
        UID: string;
        communications: Communications;
    };
     
    const pendingEmailVerification = getPendingEmailVerification(communications);
    if (pendingEmailVerification.length > 0) {
        const { access_token } = await jsonApi(tokenApi.bind(null, UID));
        await showExternalVerificationPopup(access_token);
        await showConfirmation(access_token, pendingEmailVerification);
    }
    }
}

export function getPendingEmailVerification(communications: Communications) {
    if (!communications) return [];
    console.log("communications", Object.entries(communications));
    return Object.entries(communications)
        .filter(([_, value]) => value.doubleOptIn?.status === "pending")
        .map(([key, _]) => key);
}
export function showExternalVerificationPopup(access_token: string) {
    const popup = document.createElement("div");

    popup.innerHTML = `
    <dialog id="favDialog" class="absolute top-0 right-0 p-2 font-sans text-sm font-normal break-words whitespace-normal bg-white border rounded-lg shadow-lg w-max border-blue-gray-50 text-blue-gray-500 shadow-blue-gray-500/10 focus:outline-none max-h-[90vh] max-w-[75%]">
      <form id="form" method="dialog" class="*:m-4 *:p-4">
       <button type="submit" class="flex items-center justify-center w-6 h-6 text-blue-gray-500 bg-white rounded-full shadow-lg cursor-pointer hover:bg-blue-gray-50" onclick="document.querySelector(#popover).hidePopover()">
        Verify
      </button>
        <header>This is an example of a custom verification process</header>
         <pre class="overflow-y-scroll open:max-h-52 max-h-[20vh]" >${tokenApi}</pre>
         <pre > <a href="https://jwt.io?token=${access_token}"><img alt="view on jwt.io" src="https://jwt.io/img/badge.svg"/> </a>${access_token}</pre>
      </form>
         <script src="https://cdn.tailwindcss.com?plugins=typography,aspect-ratio,line-clamp,container-queries"></script>
      </dialog>
`;

    document.body.appendChild(popup);
    const dialog = document.getElementById("favDialog") as HTMLDialogElement;
    dialog.showModal();
    return new Promise((resolve) => {
        dialog.addEventListener("submit", (e) => {
            console.log("dialog submit", e, dialog.dataset);
            resolve(e);
        });
    });
}
