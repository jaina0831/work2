// components/LoadingScreen.jsx
import { Spin } from 'antd';
import Lottie from 'lottie-react'; // 剛安裝好的套件
import dogAnimation from '../assets/dog_loading.json'; // 導入剛放進去的動畫檔

const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#e6d2b6', // 您的背景色
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      {/* 動畫容器 */}
      <div style={{ width: '450px', height: '450px' }}>
        <Lottie 
          animationData={dogAnimation} 
          loop={true} 
          autoplay={true} 
        />
      </div>
      
      {/* 提示文字 - 使用您的源泉圓體 */}
      <p style={{ 
        marginTop: '-150px', 
        fontSize: '22px', 
        fontFamily: 'GenSenRounded', 
        fontWeight: 'bold',
        color: '#4C463F',
        letterSpacing: '2px'
      }}>
        載入資訊中，請稍候...
      </p>
    </div>
  );
};

export default LoadingScreen;