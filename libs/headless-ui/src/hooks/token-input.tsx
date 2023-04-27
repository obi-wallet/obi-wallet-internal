import { zodResolver } from "@hookform/resolvers/zod";
import { Token, tokenGivenBalance } from "@obi-wallet/sdk";
import { Controller, ControllerProps, useForm } from "react-hook-form";
import z from "zod";

export function useTokenInput(balance: Token) {
  const schema = z.object({
    token: tokenGivenBalance({ chainId: "phoenix-1", balance }),
  });
  const { control, handleSubmit, ...rest } = useForm({
    defaultValues: {
      token: {
        id: balance.id,
        amount: "",
      },
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });

  return {
    ...rest,
    handleSubmit,
    renderTextInput(
      render: ControllerProps<
        {
          token: Token;
        },
        "token"
      >["render"]
    ) {
      return <Controller name="token" control={control} render={render} />;
    },
  };
}
