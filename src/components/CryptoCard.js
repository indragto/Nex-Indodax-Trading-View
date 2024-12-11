import Image from "next/image";
import { formatToRupiah } from "@/helpers/currency";
const CryptoCard = ({ selected, keyId, logo, name, price, onSelected }) => {
  return (
    <div 
      onClick={()=>{
          onSelected(keyId);
      }} 
      key={keyId} 
      className={`${selected == keyId ? `bg-gray-700` : `` } cursor-pointer mb-2 flex items-center p-4 hover:shadow-lg hover:bg-gray-700 shadow-md rounded-lg transition-shadow`}
    >
      <div className="w-16 h-16">
        <Image
          src={logo}
          alt={`${name} logo`}
          width={64}
          height={64}
          className="rounded-full"
        />
      </div>
      <div className="ml-4">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-gray-500">Min Trade: {formatToRupiah(price)}</p>
      </div>
    </div>
  );
};

export default CryptoCard;
