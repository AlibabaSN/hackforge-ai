import logging
from .db import SessionLocal, Base, engine
from .models import User, Project, ModelConfig
from .auth import hash_password

logger = logging.getLogger("hackforge.seed")

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Default Admin User
        user = db.query(User).filter(User.email == "admin@hackforge.ai").first()
        if not user:
            user = User(
                email="admin@hackforge.ai",
                hashed_password=hash_password("admin123"),
                full_name="HackForge Admin",
                avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=HackForge"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("Seeded default admin user: admin@hackforge.ai")

        # 2. Seed Pre-Populated Projects
        if db.query(Project).count() == 0:
            demo_projects = [
                Project(
                    user_id=user.id,
                    title="Autonomous Road Hazard Detection",
                    problem_statement="Build a computer vision & mobile agent system that detects road hazards (potholes, debris, collisions) using smartphone cameras and alerts nearby drivers in real time.",
                    status="READY",
                    current_stage="COMPLETE",
                    score=92,
                    artifacts={
                        "problem_analyst": {"problem_definition": "Road hazard detection with sub-second alert latency.", "complexity": 7},
                        "research_agent": {"findings": ["YOLOv8 mobile quantization achieves 45 FPS on mobile ARM", "MQTT broker yields <50ms pub/sub alert delivery"]},
                        "hackathon_judge": {"overall_score": 92, "verdict": "WINNER — High Impact Technical Innovation"}
                    }
                ),
                Project(
                    user_id=user.id,
                    title="Autonomous AI Code Auditor",
                    problem_statement="Build an autonomous code review platform that analyzes pull requests, enforces security guidelines, identifies SQL injection vulnerabilities, and runs sandboxed tests.",
                    status="READY",
                    current_stage="COMPLETE",
                    score=90,
                    artifacts={
                        "problem_analyst": {"problem_definition": "Automated security & static code analysis agent.", "complexity": 8},
                        "hackathon_judge": {"overall_score": 90, "verdict": "WINNER — Enterprise Code Security"}
                    }
                )
            ]
            db.add_all(demo_projects)
            db.commit()
            logger.info("Seeded 2 demo projects.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
