const { profile, comment, post, status, activities } = require("../models");

class CommentController {
	//===============================|| get all comment ||=========================//

	async getAllComment(req, res, next) {
		try {
			let dataComment = await comment
				.find({ status_id: req.query.status_id })
				.sort({ _id: 1 })
				.lean()
				.exec(); //id status

			let rec = (comment, threads) => {
				for (let thread in threads) {
					let value = threads[thread];

					if (thread.toString() === comment.parent_id.toString()) {
						value.children[comment._id] = comment;
						return;
					}

					if (value.children) {
						rec(comment, value.children);
					}
				}
			};

			let threads = {},
				komentar;
			for (let i = 0; i < dataComment.length; i++) {
				komentar = dataComment[i];
				komentar["children"] = {};
				let parent_id = komentar.parent_id;
				if (!parent_id) {
					threads[komentar._id] = komentar;
					continue;
				}

				rec(komentar, threads);
			}

			if (dataComment.length == 0) {
				res.status(400).json({
					success: true,
					message: "Not found",
					data: null,
				});
			} else
				res.status(200).json({
					success: true,
					message: "Success",
					data: { count: dataComment.length, comments: threads },
				});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//===============================|| get one  comment ||=========================//

	async getOneComment(req, res, next) {
		try {
			//find user id
			let dataComment = await comment
				.findOne({ _id: req.params.id })
				.populate({
					path: "status",
					select: "content owner media interest likeBy",
				})
				.exec();
			req.io.emit("comment " + dataProfile, dataProfile);

			res.status(200).json({
				success: true,
				message: "Success",
				data: dataComment,
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}
	//===============================|| create  comment ||=========================//
	async postComment(req, res, next) {
		try {
			// search status that I want to comment

			let data = {
				status_id: req.body.status_id,
				content: req.body.content,
				owner: req.profile.id,
				media: [],
			};

			if ("images" in req) {
				data.media = req.images;
			}

			if ("parent_id" in req.body) {
				data.parent_id = req.body.parent_id;
			}
			if ("depth" in req.body) {
				data.depth = req.body.depth;
			}

			let createComment = await comment.create(data);

			if (!createComment) {
				const error = new Error("Post Comment failed");
				error.statusCode = 400;
				throw error;
			} else
				await activities.create({
					type: "post_comment",
					comment_id: createComment._id,
					owner: req.profile.id,
				});

			res.status(200).json({
				success: true,
				message: "Post comment success",
				data: createComment,
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//===============================|| update comment ||=========================//

	async updateComment(req, res, next) {
		try {
			let data = {
				content: req.body.content,
				owner: req.profile.id,
			};

			if ("images" in req) {
				data.media = req.images;
			}

			let dataComment = await comment.findOneAndUpdate(
				{ _id: req.params.id }, // id comment that will be changed
				data,
				{ new: true }
			);
			if (!dataComment) {
				const error = new Error("Comment fail to be appeared");
				error.statusCode = 400;
				throw error;
			}

			res.status(200).json({
				success: true,
				message: "Update comment Success",
				data: dataComment,
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//===============================|| add like ||=========================//

	async addLike(req, res, next) {
		try {
			let findUser = await comment.findOne({ _id: req.params.id });
			if (findUser.likeBy.includes(req.profile.id)) {
				const error = new Error("You can't like twice");
				error.statusCode = 400;
				throw error;
			  } else
			  findUser.likeBy.push(req.profile.id);
			  findUser.save();
			res.status(200).json({
				success: true,
				message: "Success",
				data: findUser,
			});
			await activities.create({
				type: "like_comment",
				comment_id: findUser._id,
				owner: req.profile.id,
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//===============================|| remove like ||=========================//

	async removeLike(req, res, next) {
		try {
			let findUser = await comment.findOne({ _id: req.params.id });
			let indexOfLike = findUser.likeBy.indexOf(req.profile.id);
			findUser.likeBy.splice(indexOfLike, 1);
			let deleteLike = await comment.findOneAndUpdate(
				{ _id: findUser._id },
				findUser,
				{ new: true }
			);
			res.status(200).json({
				success: true,
				message: "Success",
				data: deleteLike,
			});
			await activities.deleteOne({ _id: req.params.id });
			next();
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}
	//===============================|| delete comment ||=========================//

	async deleteComment(req, res) {
		try {
			let deleteCom = await comment.deleteOne({ _id: req.params.id }); //id comment that want to delete
			if (!deleteCom) {
				const error = new Error("Delete comment failed");
				error.statusCode = 400;
				throw error;
			} else await activities.deleteOne({ _id: req.params.id });
			res.status(200).json({
				success: true,
				message: "Delete comment Success",
				data: deleteCom.deletedCount,
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}
}

module.exports = new CommentController();
