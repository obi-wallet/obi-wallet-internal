import { useMemo, useState } from "react";

export enum SecurityQuestion {
  Birthplace = "Birthplace",
  SchoolName = "SchoolName",
  FirstCar = "FirstCar",
  FirstKiss = "FirstKiss",
}

export function useSecurityQuestionInput() {
  const [securityQuestion, setSecurityQuestion] = useState(
    useSecurityQuestions()[0]!.value,
  );
  const [securityAnswer, setSecurityAnswer] = useState("");

  return {
    securityQuestion,
    setSecurityQuestion,
    securityAnswer,
    setSecurityAnswer,
  };
}

export function useSecurityQuestions() {
  return useMemo(() => {
    return [
      {
        label: "What city and country were you born in?",
        value: SecurityQuestion.Birthplace,
      },
      {
        label:
          "What is the full name of the last elementary/primary school you attended?",
        value: SecurityQuestion.SchoolName,
      },
      {
        label: "What was the make and model of your first car?",
        value: SecurityQuestion.FirstCar,
      },
      {
        label: "What is the full name of your first kiss?",
        value: SecurityQuestion.FirstKiss,
      },
    ];
  }, []);
}
