import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ethers } from "ethers";
import TokenABI from "../../contract-ABI/TokenAbi";
import WalletContext from "../../context/wallet-context";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import SendToken from "../../components/functions/Admin/SendTokens";
import styles from "./styles.module.css";
import MessageComponent from "./Airstack/Query";

const dummmyData = [
  ["0xa91c2d10a993d14f842d23b97f2ab3fdf6b5b9aa", "69", "TV"],
  ["0x5416e5dc14caa0950b2a24ede1eb0e97c360bcf5", "123", "Laptop"],
];

function DataCard({ data, onSelect }) {
  return (
    <div className={styles.dataCard} onClick={() => onSelect(data)}>
      <p>ID: {data[0]}</p>
      <p>Value: {data[1]}</p>
      <p>Type: {data[2]}</p>
    </div>
  );
}

function AdminPage() {
  const ctx = useContext(WalletContext);
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [allowance, setAllownce] = useState(0);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    if (ctx.admin === false && ctx.superAdmin === false) {
      navigate("/profile");
    } else {
      // Call checkBalance immediately when ctx.address is available
      checkBalance();
      checkAllowance();
    }
  }, [ctx, balance, allowance, navigate]);

  let contract;
  let claimPortal;
  if (ctx.address != null && ctx.provider != null) {
    contract = new ethers.Contract(ctx.tokenAddress, TokenABI, ctx.provider);
    console.log(contract);
  }

  async function checkBalance() {
    if (contract) {
      try {
        const balance = await contract.balanceOf(ctx.address);
        console.log("balance is ", balance);
        setBalance(balance / 1e18); // Update balance state
      } catch (error) {
        console.log(error);
      }
    }
  }
  async function checkAllowance() {
    if (contract) {
      try {
        const allowance = await contract.allowance(
          ctx.address,
          ctx.DappContract
        );
        console.log("allownce is ", formatUnits(allowance));
        setAllownce(formatUnits(allowance)); // Update balance state
      } catch (error) {
        console.log(error);
      }
    }
  }

  const handleCardSelect = (data) => {
    setSelectedData(data);
  };

  return (
    <div className={styles.adminPageSection}>
      <h1 className={styles.sectionTitle}>Admin page</h1>
      {console.log(ctx.address)}
      {contract && (
        <>
          {balance !== null && (
            <p className={styles.balanceAllowance}>
              Balance = {balance.toString()}
            </p>
          )}
          <p className={styles.balanceAllowance}>
            Allowance = {allowance.toString()}
          </p>
        </>
      )}
      <div className={styles.componentsContainer}>
        <SendToken />
      </div>

      {/* Data about the purchasers */}
      {/* <Component /> */}

      <div>
        <ul>
          {dummmyData.map((data) => (
            <li key={data[0]}>
              <Link to={data[0]}>
                {data[0]}
                <p> Purchase amount = {data[1]}</p>
                <p> Product name= {data[2]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPage;
