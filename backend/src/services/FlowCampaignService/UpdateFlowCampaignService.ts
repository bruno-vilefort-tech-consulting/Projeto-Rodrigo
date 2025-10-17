import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface Request {
  companyId: number;
  name: string;
  flowId: number;
  phrase:string
  id: number
  status: boolean
  matchType?: string;
}

const UpdateFlowCampaignService = async ({
  companyId,
  name,
  flowId,
  phrase,
  id,
  status,
  matchType
}: Request): Promise<String> => {
  try {

    const flow = await FlowCampaignModel.update({ name, phrase, flowId, status, matchType }, {
      where: {id: id}
    });

    return 'ok';
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default UpdateFlowCampaignService;
