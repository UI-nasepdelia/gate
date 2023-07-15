const fs = require("fs");
const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const { responseSuccessWithData } = require("../../utils/response");

exports.sendMessage = async (req, res, next) => {
  try {
    let to = req.body.to || req.query.to;
    let text = req.body.text || req.query.text;
    let isGroup = req.body.isGroup || req.query.isGroup;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;

    if (!to || !text) throw new ValidationError("Mau ngapain bang?");

    const receiver = to;
    if (!sessionId) throw new ValidationError("Perangkat tidak terdaftar");
    const send = await whatsapp.sendTextMessage({
      sessionId,
      to: receiver,
      isGroup: !!isGroup,
      text,
    });

    res.status(200).json(
      responseSuccessWithData({
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.sendBulkMessage = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const delay = req.body.delay || req.query.delay || req.headers.delay;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Pesan Blast Sedag Dikirim",
      },
    });
    for (const dt of req.body.data) {
      const to = dt.to;
      const text = dt.text;
      const isGroup = !!dt.isGroup;

      await whatsapp.sendTextMessage({
        sessionId,
        to: to,
        isGroup: isGroup,
        text: text,
      });
      await whatsapp.createDelay(delay ?? 5000);
    }
    console.log("PESAN BLAST BERHASIL DIKIRIM - POWERED BY CIPZZ GATEWAY");
  } catch (error) {
    next(error);
  }
};

exports.sendMedia = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const to = req.body.to || req.query.to;
    const text = req.body.text || req.query.text;
    const mediaPath = req.body.mediaPath || req.query.mediaPath;

    if (!sessionId) throw new ValidationError("Perangkat tidak terdaftar");
    if (!to) throw new ValidationError("Nomor tujuan tidak ditemukan");
    if (!mediaPath) throw new ValidationError("Path media tidak ditemukan");

    const media = fs.readFileSync(mediaPath);
    const send = await whatsapp.sendImage({
      sessionId,
      to,
      text,
      media,
    });

    res.status(200).json(
      responseSuccessWithData({
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      })
    );
  } catch (error) {
    next(error);
  }
};