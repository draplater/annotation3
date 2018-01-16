import json

import sys
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.automap import automap_base
from jsonrpc.backend.flask import JSONRPCAPI


def cpb_html_extraction(name):
    desc_file = f"./cpb2/data/html_frames/{name}.html"
    with open(desc_file, "rb") as f:
        content = f.read().decode("gbk", "ignore")
        splits = content.split("<hr><br><h3>")
        assert len(splits) >= 2
        return ["<h3>" + i for i in splits[1:]]


class AnnotationService(Flask):
    def __init__(self):
        super(AnnotationService, self
              ).__init__(self.__class__.__name__,
                         static_folder="./static/")
        self.api = JSONRPCAPI()
        self.add_url_rule("/api", view_func=self.api.as_view(), methods=["POST"])
        self.add_url_rule("/api/framenet/<path:path>",
                          view_func=self.framenet, methods=["GET"])
        self.add_url_rule("/<path:path>",
                          view_func=self.index, methods=["GET"])
        self.add_url_rule("/",
                          view_func=self.index, methods=["GET"])
        self.api.dispatcher.add_method(self.get_annotation)
        self.api.dispatcher.add_method(self.add_annotation)
        self.api.dispatcher.add_method(self.del_annotation)
        self.api.dispatcher.add_method(self.get_comment)
        self.api.dispatcher.add_method(self.set_comment)
        self.api.dispatcher.add_method(self.get_frameset)
        self.api.dispatcher.add_method(self.get_verb_to_frames)
        self.api.dispatcher.add_method(self.get_verb_to_frames)
        self.api.dispatcher.add_method(self.search)

        self.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///annotation.sqlite'

        # Automatically use SQL table schema
        self.db = SQLAlchemy(self)
        Base = automap_base()
        Base.prepare(self.db.engine, reflect=True)
        self.annotation = Base.classes.annotation
        self.comment = Base.classes.comment

        with open("records.json", "r") as f:
            self.framesets = json.load(f)

        with open("verb_to_frames.json", "r") as f:
            self.verb_to_frames = json.load(f)

    def framenet(self, path):
        return send_from_directory("fndata-1.5", path)

    def index(self, path="index.html"):
        return send_from_directory("dist", path)

    def get_frameset(self, no):
        frameset = self.framesets[no]
        return {
          "name": frameset[0],
          "file": frameset[1],
          "idx": frameset[2],
          "content": frameset[3]
        }

    def get_verb_to_frames(self, verb):
        return self.verb_to_frames[verb]

    def get_annotation(self, username, lexicon, frameset):
        frames = {i.frame: i.confidence for i in
                   self.db.session.query(self.annotation).filter_by(
                       username=username,
                       lexicon=lexicon,
                       frameset=frameset
                   )
                 }
        return {"frames": frames}

    def add_annotation(self, username, lexicon, frameset, frame, confidence):
        self.db.session.merge(self.annotation(username=username,
                                              lexicon=lexicon,
                                              frameset=frameset,
                                              frame=frame,
                                              confidence=confidence))
        self.db.session.commit()

    def del_annotation(self, username, lexicon, frameset, frame):
        self.db.session.query(self.annotation).filter_by(
            username=username,
            lexicon=lexicon,
            frameset=frameset,
            frame=frame
          ).delete()
        self.db.session.commit()

    def get_comment(self, username, lexicon, frameset):
        comments = [i.comment for i in
                    self.db.session.query(self.comment).filter_by(
                        username=username,
                        lexicon=lexicon,
                        frameset=frameset
                    )]
        if not comments:
          return ""
        return comments[0]

    def set_comment(self, username, lexicon, frameset, comment):
        self.db.session.merge(self.comment(username=username,
                                           lexicon=lexicon,
                                           frameset=frameset,
                                           comment=comment
                                           ))
        self.db.session.commit()

    def search(self, keyword):
        return [[idx, i[0]] for idx, i in enumerate(self.framesets)
                if i[0].find(keyword) >= 0]

    @classmethod
    def start(cls, port=9998):
      cls().run(host="0.0.0.0", port=port, threaded=True)


if __name__ == '__main__':
    try:
        AnnotationService.start(sys.argv[1])
    except IndexError:
      AnnotationService.start()
