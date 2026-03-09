import { useAppContext } from "../../context/AppContext";
import { Panel } from "../ui/Panel";
import { FormGroup, FormInput } from "../ui/Modal";

export function IncomeSettings() {
  const { state, dispatch } = useAppContext();

  return (
    <Panel title="Default Income">
      <div className="p-6">
        <div className="max-w-xs">
          <FormGroup label="Default Take-Home Pay">
            <FormInput
              type="number"
              step="0.01"
              value={state.settings.defaultTakeHomePay}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_SETTINGS",
                  defaultTakeHomePay: parseFloat(e.target.value) || 0,
                })
              }
            />
          </FormGroup>
        </div>
        <p className="text-xs text-text3 mt-4">
          Used as the default monthly take-home pay when starting new months.
          Changes here do not affect existing months.
        </p>
      </div>
    </Panel>
  );
}
