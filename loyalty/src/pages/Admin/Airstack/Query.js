import { init, useQuery } from "@airstack/airstack-react";
import { Link, useParams } from "react-router-dom";
import MessagePage from "./MessagePage";

init("15868ffc9c64c4af68a431072b80b246f");

const MessageComponent = () => {
  const params = useParams();
  const address = params.address;
  const query = `query MyQuery {
        XMTPs(
            input: {
                blockchain: ALL
                filter: { owner: { _eq: "${address}" } }
            }
            ) {
                XMTP {
                    isXMTPEnabled
                }
            }
        }`;

  const { data, loading, error } = useQuery(query);

  return (
    <div>
      {address}

      {data && <p>Data: {JSON.stringify(data)}</p>}

      {loading && <p> Loading</p>}

      {error && <p> Error: {error.message}</p>}

      <Link to="message">Message</Link>
      <p>
        <Link to=".." relative="path">
          Back
        </Link>
      </p>
    </div>
  );
};

export default MessageComponent;
