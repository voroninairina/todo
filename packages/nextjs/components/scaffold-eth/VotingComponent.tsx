import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const VotingComponent = () => {
  const { address } = useAccount();
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { data: deployedContractData } = useDeployedContractInfo("SimpleVoting");

  const { data: votingTopic } = useScaffoldReadContract({
    contractName: "SimpleVoting",
    functionName: "votingTopic",
  });

  const { data: votes } = useScaffoldReadContract({
    contractName: "SimpleVoting",
    functionName: "getVotes",
  });

  const { data: votingStatus } = useScaffoldReadContract({
    contractName: "SimpleVoting",
    functionName: "getVotingStatus",
  });

  const { data: hasVoted } = useScaffoldReadContract({
    contractName: "SimpleVoting",
    functionName: "hasVoted",
    args: [address],
  });

  const { writeContractAsync: voteFor, isPending: votingFor } = useScaffoldWriteContract("SimpleVoting");

  const { writeContractAsync: voteAgainst, isPending: votingAgainst } = useScaffoldWriteContract("SimpleVoting");

  const handleVoteFor = async () => {
    try {
      await voteFor({
        functionName: "vote",
        args: [true],
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleVoteAgainst = async () => {
    try {
      await voteAgainst({
        functionName: "vote",
        args: [false],
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Таймер обратного отсчета
  useEffect(() => {
    if (votingStatus && votingStatus[0]) {
      const interval = setInterval(() => {
        const remaining = Number(votingStatus[1]);
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
        } else {
          setTimeLeft("00:00");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [votingStatus]);

  const totalVotes = votes ? Number(votes[0]) + Number(votes[1]) : 0;
  const forPercentage = totalVotes > 0 ? (Number(votes?.[0]) / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (Number(votes?.[1]) / totalVotes) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold mb-6 justify-center">🗳️ Система голосования</h2>

          {/* Тема голосования */}
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Тема:</h3>
            <p className="text-lg bg-base-200 p-4 rounded-lg">{votingTopic || "Загрузка..."}</p>
          </div>

          {/* Статистика голосования */}
          <div className="mb-6">
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <div className="stat">
                <div className="stat-figure text-success">
                  <span className="text-2xl">👍</span>
                </div>
                <div className="stat-title">Голоса ЗА</div>
                <div className="stat-value text-success">{votes ? votes[0].toString() : "0"}</div>
                <div className="stat-desc">{forPercentage.toFixed(1)}%</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-error">
                  <span className="text-2xl">👎</span>
                </div>
                <div className="stat-title">Голоса ПРОТИВ</div>
                <div className="stat-value text-error">{votes ? votes[1].toString() : "0"}</div>
                <div className="stat-desc">{againstPercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Прогресс-бары */}
          {totalVotes > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>ЗА ({forPercentage.toFixed(1)}%)</span>
                <span>ПРОТИВ ({againstPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex h-4 bg-base-200 rounded-full overflow-hidden">
                <div className="bg-success transition-all duration-500" style={{ width: `${forPercentage}%` }}></div>
                <div className="bg-error transition-all duration-500" style={{ width: `${againstPercentage}%` }}></div>
              </div>
            </div>
          )}

          {/* Кнопки голосования */}
          {!hasVoted && votingStatus && votingStatus[0] && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button className="btn btn-success btn-lg flex-1" onClick={handleVoteFor} disabled={votingFor}>
                {votingFor ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Голосую...
                  </>
                ) : (
                  "👍 ГОЛОСОВАТЬ ЗА"
                )}
              </button>
              <button className="btn btn-error btn-lg flex-1" onClick={handleVoteAgainst} disabled={votingAgainst}>
                {votingAgainst ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Голосую...
                  </>
                ) : (
                  "👎 ГОЛОСОВАТЬ ПРОТИВ"
                )}
              </button>
            </div>
          )}

          {/* Сообщения о статусе */}
          <div className="space-y-4">
            {hasVoted && (
              <div className="alert alert-info">
                <span>✅ Вы уже проголосовали в этом голосовании</span>
              </div>
            )}

            {votingStatus && !votingStatus[0] && (
              <div className="alert alert-warning">
                <span>⏰ Голосование завершено</span>
              </div>
            )}

            {votingStatus && votingStatus[0] && timeLeft && (
              <div className="alert alert-success">
                <span>🕐 Голосование активно! Осталось: {timeLeft}</span>
              </div>
            )}
          </div>

          {/* Общая информация */}
          <div className="text-center text-sm text-base-content/60 mt-4">
            <p>Всего проголосовало: {totalVotes} человек</p>
            <p>Адрес контракта: {deployedContractData?.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};