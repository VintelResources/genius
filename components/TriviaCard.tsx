'use client'; 

export default function TriviaCard({ question, options, correct }: { question: string, options: string[], correct: string }) {
  
  const handleAnswer = (selectedOption: string) => {
    alert(selectedOption === correct ? "Correct!" : "Try Again!");
  };

  return (
    <div className="mb-8 p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-4">{question}</h2>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, index) => (
          <button 
            key={index}
            className="bg-blue-100 hover:bg-blue-200 p-2 rounded border border-blue-300"
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

