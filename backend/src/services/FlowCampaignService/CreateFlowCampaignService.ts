import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface Request {
  userId: number;
  name: string;
  companyId: number
  flowId: number;
  phrase: string;
  whatsappId: string;
  matchType?: string;
  status?: boolean;
}

const CreateFlowCampaignService = async ({
  userId,
  name,
  companyId,
  phrase,
  whatsappId,
  flowId,
  matchType = "contains",
  status = true
}: Request): Promise<FlowCampaignModel> => {
  const flow = await FlowCampaignModel.create({
    userId: userId,
    companyId: companyId,
    name: name,
    phrase: phrase,
    flowId: flowId,
    whatsappId: whatsappId,
    matchType: matchType,
    status: status
  });

  return flow;
};

export default CreateFlowCampaignService;
