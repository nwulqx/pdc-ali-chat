package com.aliyun.bailian.chatgpt.client;


import com.aliyun.bailian.chatgpt.config.DocConfig;
import com.aliyun.bailian.chatgpt.config.LlmConfig;
import com.aliyun.bailian.chatgpt.dto.*;
import com.aliyun.bailian.chatgpt.enums.ErrorCodeEnum;
import com.aliyun.bailian.chatgpt.enums.ImportDocStatusEnum;
import com.aliyun.bailian.chatgpt.exceptions.BizException;
import com.aliyun.bailian.chatgpt.utils.LogUtils;
import com.aliyun.bailian20230601.Client;
import com.aliyun.bailian20230601.models.*;
import com.aliyun.broadscope.bailian.sdk.consts.ConfigConsts;
import com.aliyun.teaopenapi.models.Config;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * doc manager client
 *
 * @author yuanci
 */
@Component
public class DocManagerClient {
    @Resource
    private LlmConfig llmConfig;

    @Resource
    private DocConfig docConfig;

    private Config config;

    private String agentKey;

    @PostConstruct
    public void init() {
        String accessKeyId = llmConfig.getAccessKeyId();
        String accessKeySecret = llmConfig.getAccessKeySecret();
        agentKey = llmConfig.getAgentKey();

        config = new Config().setAccessKeyId(accessKeyId)
                .setAccessKeySecret(accessKeySecret);

        String popEndpoint = llmConfig.getPopEndpoint();
        if (StringUtils.isNotBlank(popEndpoint)) {
            config.setEndpoint(popEndpoint);
        } else {
            config.setEndpoint(ConfigConsts.POP_ENDPOINT);
        }

        Integer timeout = llmConfig.getTimeout();
        if (timeout != null && timeout > 0) {
            config.setReadTimeout(timeout * 1000);
        }
    }

    public UploadPolicyResponseDTO geUploadPolicy(UploadPolicyRequestDTO uploadPolicyRequest) throws Exception {
        Long start = System.currentTimeMillis();

        if (uploadPolicyRequest == null || StringUtils.isBlank(uploadPolicyRequest.getUserId())
                || StringUtils.isBlank(uploadPolicyRequest.getFileName())) {
            String requestId = uploadPolicyRequest == null ? "" : uploadPolicyRequest.getRequestId();
            LogUtils.monitor(requestId, "DocManagerClient", "geUploadPolicy", "error",
                    start, uploadPolicyRequest, ErrorCodeEnum.PARAMS_INVALID.getErrorMessage());
            throw new BizException(ErrorCodeEnum.PARAMS_INVALID);
        }

        Client client = new Client(config);
        GetFileStoreUploadPolicyRequest request = new GetFileStoreUploadPolicyRequest()
                .setAgentKey(agentKey)
                .setUserId(uploadPolicyRequest.getUserId())
                .setFileName(uploadPolicyRequest.getFileName());

        Long fileStoreId = docConfig.getFileStoreId();
        if (fileStoreId != null && fileStoreId > 0) {
            request.setFileStoreId(fileStoreId);
        }

        GetFileStoreUploadPolicyResponse response = client.getFileStoreUploadPolicy(request);
        GetFileStoreUploadPolicyResponseBody body = response.getBody();
        if (body == null) {
            LogUtils.monitor(uploadPolicyRequest.getRequestId(), "DocManagerClient", "geUploadPolicy",
                    "error", start, uploadPolicyRequest, "response body empty");
            throw new BizException(ErrorCodeEnum.GET_UPLOAD_POLICY_ERROR);
        }

        if (!body.success) {
            String requestId = body.requestId;
            if (StringUtils.isBlank(requestId)) {
                requestId = response.getHeaders().get("x-acs-request-id");
            }

            LogUtils.monitor(uploadPolicyRequest.getRequestId(), "DocManagerClient", "geUploadPolicy",
                    "error", start, uploadPolicyRequest, body.errorMsg);
            throw new BizException(body.errorCode, body.errorMsg);
        }

        GetFileStoreUploadPolicyResponseBody.GetFileStoreUploadPolicyResponseBodyData data = body.getData();
        if (data == null) {
            LogUtils.monitor(uploadPolicyRequest.getRequestId(), "DocManagerClient", "geUploadPolicy",
                    "error", start, uploadPolicyRequest, "response data empty");
            throw new BizException(ErrorCodeEnum.GET_UPLOAD_POLICY_ERROR);
        }

        UploadPolicyResponseDTO uploadPolicyResponse = new UploadPolicyResponseDTO();
        uploadPolicyResponse.setAccessId(data.getAccessId());
        uploadPolicyResponse.setPolicy(data.getPolicy());
        uploadPolicyResponse.setSignature(data.getSignature());
        uploadPolicyResponse.setSecurityToken(data.getSecurityToken());
        uploadPolicyResponse.setDir(data.getDir());
        uploadPolicyResponse.setHost(data.getHost());
        uploadPolicyResponse.setExpire(data.getExpire());
        uploadPolicyResponse.setKey(data.getKey());

        return uploadPolicyResponse;

    }

    public ImportDocumentResponseDTO importDocument(ImportDocumentRequestDTO documentRequest) throws Exception {
        Long start = System.currentTimeMillis();

        if (documentRequest == null || StringUtils.isBlank(documentRequest.getUserId())
                || StringUtils.isBlank(documentRequest.getFileName())) {
            String msgId = documentRequest == null ? "" : documentRequest.getRequestId();
            LogUtils.monitor(msgId, "DocManagerClient", "importDocument", "error", start,
                    documentRequest, ErrorCodeEnum.PARAMS_INVALID.getErrorMessage());
            throw new BizException(ErrorCodeEnum.PARAMS_INVALID);
        }

        Client client = new Client(config);
        ImportUserDocumentRequest request = new ImportUserDocumentRequest()
                .setAgentKey(agentKey)
                .setUserId(documentRequest.getUserId())
                .setFileName(documentRequest.getFileName())
                .setOssPath(documentRequest.getOssPath());

        Long fileStoreId = docConfig.getFileStoreId();
        if (fileStoreId != null && fileStoreId > 0) {
            request.setFileStoreId(fileStoreId);
        }

        Long storeId = docConfig.getStoreId();
        if (storeId != null && storeId > 0) {
            request.setStoreId(storeId);
        }

        ImportUserDocumentResponse response = client.importUserDocument(request);
        ImportUserDocumentResponseBody body = response.getBody();
        if (body == null) {
            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "importDocument", "error", start, documentRequest);
            throw new BizException(ErrorCodeEnum.IMPORT_DOCUMENT_ERROR);
        }

        if (!body.success) {
            String requestId = body.requestId;
            if (StringUtils.isBlank(requestId)) {
                requestId = response.getHeaders().get("x-acs-request-id");
            }

            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "importDocument", "error", start, documentRequest, requestId);
            throw new BizException(body.errorCode, body.errorMsg);
        }

        ImportUserDocumentResponseBody.ImportUserDocumentResponseBodyData data = body.getData();
        if (data == null) {
            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "importDocument", "error", start, documentRequest);
            throw new BizException(ErrorCodeEnum.IMPORT_DOCUMENT_ERROR);
        }

        QueryDocumentRequestDTO queryDocumentRequest = new QueryDocumentRequestDTO();
        queryDocumentRequest.setRequestId(documentRequest.getRequestId());
        queryDocumentRequest.setUserId(documentRequest.getUserId());
        queryDocumentRequest.setDataId(data.getDataId());
        CompletableFuture<QueryDocumentResponseDTO> future = CompletableFuture.supplyAsync(() -> {
            QueryDocumentResponseDTO queryDocumentResponse = null;
            try {
                do {
                    queryDocumentResponse = queryUserDocument(queryDocumentRequest);
                    if (queryDocumentResponse != null && (ImportDocStatusEnum.SUCCESS.getStatus().equals(queryDocumentResponse.getDataStatus())
                            || ImportDocStatusEnum.FAIL.getStatus().equals(queryDocumentResponse.getDataStatus()))) {
                        break;
                    }

                    Thread.sleep(2000);
                } while (queryDocumentResponse != null && ImportDocStatusEnum.IMPORTING.getStatus().equals(queryDocumentResponse.getDataStatus()));
            } catch (BizException e) {
                throw e;
            } catch (Exception e) {
                throw new BizException(ErrorCodeEnum.QUERY_DOCUMENT_ERROR, e);
            }

            return queryDocumentResponse;
        });

        QueryDocumentResponseDTO queryDocumentResponse = null;
        try {
            queryDocumentResponse = future.get(docConfig.getTimeout(), TimeUnit.SECONDS);
            if (queryDocumentResponse == null || !ImportDocStatusEnum.SUCCESS.getStatus().equals(queryDocumentResponse.getDataStatus())) {
                throw new BizException(ErrorCodeEnum.QUERY_DOCUMENT_ERROR);
            }
        } catch (ExecutionException e) {
            throw (Exception) e.getCause();
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new BizException(ErrorCodeEnum.IMPORT_DOCUMENT_TIMEOUT);
        }

        ImportDocumentResponseDTO importDocumentResponseDTO = new ImportDocumentResponseDTO();
        importDocumentResponseDTO.setDataId(queryDocumentResponse.getDataId());
        importDocumentResponseDTO.setDataStatus(queryDocumentResponse.getDataStatus());

        return importDocumentResponseDTO;
    }

    public QueryDocumentResponseDTO queryUserDocument(QueryDocumentRequestDTO documentRequest) throws Exception {
        Long start = System.currentTimeMillis();

        if (documentRequest == null || StringUtils.isBlank(documentRequest.getUserId())) {
            String msgId = documentRequest == null ? "" : documentRequest.getRequestId();
            LogUtils.monitor(msgId, "DocManagerClient", "queryUserDocument", "error", start, documentRequest);
            throw new BizException(ErrorCodeEnum.PARAMS_INVALID);
        }

        Client client = new Client(config);
        QueryUserDocumentRequest request = new QueryUserDocumentRequest()
                .setAgentKey(agentKey)
                .setUserId(documentRequest.getUserId())
                .setDataId(documentRequest.getDataId());

        QueryUserDocumentResponse response = client.queryUserDocument(request);
        QueryUserDocumentResponseBody body = response.getBody();
        if (body == null) {
            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "queryUserDocument", "error", start, documentRequest);
            throw new BizException(ErrorCodeEnum.QUERY_DOCUMENT_ERROR);
        }

        if (!body.success) {
            String requestId = body.requestId;
            if (StringUtils.isBlank(requestId)) {
                requestId = response.getHeaders().get("x-acs-request-id");
            }

            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "queryUserDocument", "error", start, documentRequest, requestId);
            throw new BizException(body.errorCode, body.errorMsg);
        }

        QueryUserDocumentResponseBody.QueryUserDocumentResponseBodyData data = body.getData();
        if (data == null) {
            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "queryUserDocument", "error", start, documentRequest);
            throw new BizException(ErrorCodeEnum.IMPORT_DOCUMENT_ERROR);
        }

        if (ImportDocStatusEnum.FAIL.getStatus().equals(data.getDataStatus())) {
            LogUtils.monitor(documentRequest.getRequestId(), "DocManagerClient", "queryUserDocument", "error", start, documentRequest, response);
        }

        QueryDocumentResponseDTO documentResponse = new QueryDocumentResponseDTO();
        documentResponse.setDataId(data.getDataId());
        documentResponse.setDataStatus(data.getDataStatus());

        return documentResponse;
    }
}
