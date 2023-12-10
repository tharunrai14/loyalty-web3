import React, { useContext } from "react";
import {
  Client,
  useStreamMessages,
  useClient,
  useMessages,
  useConversations,
  useCanMessage,
  useStartConversation,
} from "@xmtp/react-sdk";
import WalletContext from "../../../context/wallet-context";

function MessagePage() {
  const keys = "15868ffc9c64c4af68a431072b80b246f";
  const ctx = useContext(WalletContext);

  const { client, initialize } = useClient();
  const { conversations } = useConversations();
  const { startConversation } = useStartConversation();
  const { canMessage } = useCanMessage();
  const signer = ctx.provider;
  let xmtp;
  const initXmtp = async () => {
    const options = {
      persistConversations: false,
      env: "dev",
    };
    try {
      console.log(signer);
      xmtp = await Client.create(signer, { env: "dev" });
      //await initialize({ options, signer });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      MessagePage main
      <button onClick={initXmtp}>Connect to XMTP</button>;
    </div>
  );
}

export default MessagePage;
