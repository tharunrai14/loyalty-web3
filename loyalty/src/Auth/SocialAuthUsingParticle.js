import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { useContext, useState } from "react";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import { Form, useNavigate } from "react-router-dom";
import SendToken from "../components/SendToken";
import WalletContext from "../context/wallet-context";
import DappABI from "../contract-ABI/DappABI";
import ClaimPortalABI from "../contract-ABI/ClaimPortalABI";
import styles from "./login.module.css"
export default function SocialAuthUsingParticle() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [smartAccount, setSmartAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const ctx = useContext(WalletContext);
  const navigate = useNavigate();

  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: "7372f9b0-f9a5-4ae8-b98a-3ea2c528fa80",
    clientKey: "cDs5SMAkmcr7a5dwU4vZh6Lv3B8MHktdEORk2YKO",
    appId: "78169d25-7468-4b50-b82b-f0a61f49a725",
    chainName: "polygon", //optional: current chain name, default Ethereum.
    chainId: ChainId.POLYGON_MUMBAI,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });

  const bundler = new Bundler({
    bundlerUrl:
      "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",

    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster = new BiconomyPaymaster({
    paymasterUrl:
      "https://paymaster.biconomy.io/api/v1/80001/BleEdu_JM.ece6238c-ff7f-447a-9035-ad9a88b7a702",
  });

  console.log(ctx);

  const connect = async () => {
    try {
      console.log("This", ctx);
      setLoading(true);
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo.google_email);
      const email = userInfo.google_email;
      setEmail(userInfo.google_email);
      const particleProvider = new ParticleProvider(particle.auth);
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
      setProvider(web3Provider);
      const biconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
      };
      let biconomySmartAccount = new BiconomySmartAccount(
        biconomySmartAccountConfig
      );
      console.log("This");
      biconomySmartAccount = await biconomySmartAccount.init();
      const add = await biconomySmartAccount.getSmartAccountAddress();
      setAddress(add);
      setSmartAccount(biconomySmartAccount);
      //Context here
      console.log("First", web3Provider);
      ctx.smartAccount = biconomySmartAccount;
      ctx.provider = web3Provider;
      ctx.address = add;
      console.log("second", ctx.provider);

      localStorage.setItem("address", add);
      checkStatus();
      handleClick(email, add);
      // navigate("/profile");
    } catch (error) {
      console.error(error);
    }
  };

  const checkStatus = async () => {
    try {
      const ClaimPortalContract = new ethers.Contract(
        ctx.ClaimPortalAddress,
        ClaimPortalABI,
        ctx.provider
      );
      console.log("Token Contract", ClaimPortalContract);
      const isAdmin = await ClaimPortalContract.isAdmin(ctx.address);
      const isSuperAdmin = await ClaimPortalContract.isSuperAdmin(ctx.address);
      console.log("This section ", isAdmin);
      setIsAdmin(isAdmin);
      setIsSuperAdmin(isSuperAdmin);
      console.log("Admin Check", isAdmin, " Super Admin check", isSuperAdmin);
      ctx.admin = isAdmin;
      ctx.superAdmin = isSuperAdmin;
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };
  const handleClick = async (email, address) => {
    const apiUrl = "http://localhost:1337/api/members";
    const requestBody = {
      data: {
        email: email,
        address: address,
        link: {
          id: 1,
          type: "abc",
        },
      },
    };

    try {
      const apiUrl = "http://localhost:1337/api/members";

      console.log("here", email);
      console.log("mp", address);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            email: email,
            address: address,
          },
        }),
      });
      console.log(response);

      const responseData = await response.json();
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  };

  return (
    <>
      {ctx.address && navigate("/profile")}
      <Form  action="login" method="post">
       <div className={styles.logintext}> <h1>
          <title >Login to WAGMI </title>
          <meta name="description" content="Login" />
        </h1>
        <div className={styles.logintextdata}><h1 >Login to WAGMI</h1>
        {!loading && !address && (
          <button className={styles.loginb} onClick={connect}>Click to login</button>
        )}
        {/* {(ctx.provider = provider)}
        {(ctx.address = address)}*/}
        {/* {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>} */}
        {/* {smartAccount && provider && (
          <SendToken
          smartAccount={smartAccount}
          address={address}
          provider={provider}
          />
        )} */}
        </div>
        </div>
      </Form>

      {ctx.address && navigate("/profile")}
    </>
  );
}
