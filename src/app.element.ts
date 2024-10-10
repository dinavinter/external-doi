import "@gigya/wc";
import {useGigya} from "@gigya/wc";
import {externalDoi} from "@/external.verify";

 

export class AppElement extends HTMLElement {
    constructor() {
        super();
        console.log(
            "screen:ctor",
            import.meta.env.GIGYA_DOMAIN,
            import.meta.env.GIGYA_API_KEY,
            
        );
        const tailwind = document.createElement("script");
        tailwind.src =   "https://cdn.tailwindcss.com?plugins=typography,aspect-ratio,line-clamp,container-queries";
        document.head.appendChild(tailwind);
        const style =document.head.appendChild(document.createElement("style"))
        style.innerHTML = ` 
               @tailwind base;
                @tailwind components;
                @tailwind utilities;
                @tailwind screens;
                @tailwind forms;
        `;
        const div = this.appendChild(document.createElement("div"));
        div.id = "screen-container";
    }

     async connectedCallback() {
         const button = this.appendChild(document.createElement("button"));
         button.innerHTML = "Reload...";

         button.onclick = () => {
             gigya?.accounts.showScreenSet({
                 screenSet: "Default-RegistrationLogin",
                 startScreen: "gigya-register-screen",
                 containerID: "screen-container",
             });
         };


         const gigya = await useGigya(g=>g);
         console.log("app:loaded  🥳", gigya);

         gigya.accounts.session.verify({
            callback: (response) => {
                console.log("session.verify", response);
                if (response.errorCode === 0) {
                    gigya.accounts.showScreenSet({
                        screenSet: "Default-ProfileUpdate",
                        containerID: "screen-container",
                        onAfterSubmit: externalDoi,
                    });
                } else {
                    gigya?.accounts.showScreenSet({
                        screenSet: "Default-RegistrationLogin",
                        startScreen: "gigya-register-screen",
                        containerID: "screen-container",
                        onAfterSubmit: externalDoi,
                    });
                }
            }
        });
    }
 

    disconnectedCallback() {
        console.debug(
            "screen:disconnectedCallback",
            import.meta.env.GIGYA_DOMAIN,
            import.meta.env.GIGYA_API_KEY
        );
    }
}


customElements.define("registration-screen", AppElement);

