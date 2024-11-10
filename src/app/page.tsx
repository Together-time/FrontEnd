import React from "react";
import ProjectList from "@/components/projectList/projectList";
import '@/page.css';

const Home: React.FC = () => {
    return (
        <div className="container">
          <div className="left left-container">
            <ProjectList />
          </div>
          <div className="middle">
            {/* 중간 구역 콘텐츠 */}
          </div>
          <div className="right">
            {/* 오른쪽 구역 콘텐츠 */}
          </div>
        </div>
      );
};

export default Home;